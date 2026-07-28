import { createMcpHonoApp } from "@modelcontextprotocol/hono";
import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

const DISCORD_WEBHOOK_URL_PATTERN =
	/^https:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/;

function buildServer(): McpServer {
	const server = new McpServer({
		name: "discord-webhook-relay-mcp",
		version: "1.0.0",
	});

	server.registerTool(
		"send_discord_message",
		{
			title: "Send Discord Message",
			description: "Sends a message to a Discord webhook URL.",
			inputSchema: z.object({
				webhookUrl: z
					.string()
					.regex(
						DISCORD_WEBHOOK_URL_PATTERN,
						"Not a valid Discord webhook URL.",
					)
					.describe("The destination Discord webhook URL"),
				message: z.string().min(1).max(2000).describe("The message to send"),
			}),
		},
		async ({ webhookUrl, message }) => {
			const response = await fetch(webhookUrl, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ content: message }),
			});

			if (!response.ok) {
				const body = await response.text();
				return {
					isError: true,
					content: [
						{
							type: "text",
							text: `Failed to send to Discord (status: ${response.status}): ${body}`,
						},
					],
				};
			}

			return {
				content: [{ type: "text", text: "Message sent to Discord." }],
			};
		},
	);

	return server;
}

const handler = createMcpHandler(buildServer);

// Cloudflare Workers has no localhost bind, so the package's default
// 127.0.0.1 DNS-rebinding check would 403 every real request; host:
// "0.0.0.0" opts out of that automatic localhost-only validation.
const app = createMcpHonoApp({ host: "0.0.0.0" });

app.get("/health", (c) => c.json({ status: "ok" }));
app.all("/mcp", (c) => handler.fetch(c.req.raw));

export default app;
