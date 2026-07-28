import { env, exports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("Discord webhook relay MCP worker", () => {
	it("responds with ok on /health (unit style)", async () => {
		const request = new IncomingRequest("http://example.com/health");
		const response = await exports.default.fetch(request, env);
		expect(await response.json()).toEqual({ status: "ok" });
	});

	it("responds with ok on /health (integration style)", async () => {
		const response = await exports.default.fetch("https://example.com/health");
		expect(await response.json()).toEqual({ status: "ok" });
	});
});
