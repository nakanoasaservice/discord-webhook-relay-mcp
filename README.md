# Discord Webhook Relay MCP

An MCP server that does one thing: takes a Discord webhook URL and a message, and sends the
message to Discord. Built with the [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)'s
[Hono middleware](https://github.com/modelcontextprotocol/typescript-sdk/tree/main/packages/middleware/hono),
running on Cloudflare Workers.

## Stack

- **Runtime**: Cloudflare Workers
- **MCP**: `@modelcontextprotocol/server` + `@modelcontextprotocol/hono`
- **Framework**: Hono
- **Language**: TypeScript
- **Test**: Vitest + `@cloudflare/vitest-pool-workers`
- **Linter/Formatter**: Biome

## Getting Started

```bash
bun install
bun run dev
```

`http://localhost:8787/` is the MCP endpoint (Streamable HTTP).

## Tool

### `send_discord_message`

| Parameter    | Type   | Description                              |
|--------------|--------|-------------------------------------------|
| `webhookUrl` | string | The destination Discord webhook URL       |
| `message`    | string | The message to send (1–2000 characters)  |

`webhookUrl` is validated to match the shape of a Discord webhook URL, then the server sends
`POST { content: message }` to it.

## Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start local dev server |
| `bun run deploy` | Deploy to Cloudflare Workers |
| `bun run test` | Run tests |
| `bun run check` | Lint and format check |
| `bun run check:fix` | Auto-fix lint and format issues |
| `bun run cf-typegen` | Generate Cloudflare binding types |

## Project Structure

```
src/
  index.ts   # MCP server and Hono app entry point
wrangler.jsonc # Wrangler configuration
```

## Notes

- Cloudflare Workers has no concept of a local bind, so `createMcpHonoApp`'s default
  localhost-only DNS-rebinding protection is disabled via `host: "0.0.0.0"` (see `src/index.ts`).
  Restrict it further with `allowedHosts` if you need to lock it down to your deployed hostname.
- The webhook URL is passed in as a tool argument on every call, so the server never stores or
  needs to hold a secret for it.
