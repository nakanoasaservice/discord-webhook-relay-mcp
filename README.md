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
- **Test**: Vitest + `@cloudflare/vitest-plugin`
- **Development toolchain**: Vite+ (Oxlint, Oxfmt and Vitest)

## Getting Started

```bash
pnpm install
pnpm run dev
```

`http://localhost:8787/` is the MCP endpoint (Streamable HTTP).

## Tool

### `send_discord_message`

| Parameter    | Type   | Description                             |
| ------------ | ------ | --------------------------------------- |
| `webhookUrl` | string | The destination Discord webhook URL     |
| `message`    | string | The message to send (1–2000 characters) |

`webhookUrl` is validated to match the shape of a Discord webhook URL, then the server sends
`POST { content: message }` to it.

## Commands

| Command               | Description                       |
| --------------------- | --------------------------------- |
| `pnpm run dev`        | Start local dev server            |
| `pnpm run deploy`     | Deploy to Cloudflare Workers      |
| `pnpm run test`       | Run tests                         |
| `pnpm run check`      | Lint and format check             |
| `pnpm run check:fix`  | Auto-fix lint and format issues   |
| `pnpm run cf-typegen` | Generate Cloudflare binding types |

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

## Development toolchain

Use Node.js 24 and the pnpm version pinned in `package.json`.
Run `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm test`, and `pnpm build`.
Vite+ provides formatting, linting, type checks and tests. Tests run locally
in the Cloudflare Workers runtime. The build task bundles with Wrangler in
dry-run mode; it does not deploy. Use `pnpm dev` for local development.

Update Vite+ and its bundled tools together with `vp migrate`, then update the
pinned `setup-vp` version in CI and refresh the pnpm lockfile. Run the project's
checks before committing toolchain updates.

### Runtime versions

`package.json` is the source of truth for development Node.js (`devEngines.runtime`)
and pnpm (`packageManager`). The major versions in `mise.toml` only bootstrap the
environment. Install the [global Vite+ CLI](https://viteplus.dev/guide/global-cli)
with environment management enabled, then use `vp install --frozen-lockfile`
and `vp run <script>` to run with the declared versions. `pnpm` commands also use
them when the Vite+ shims are active. The project-local CLI alone does not switch
Node.js versions.

CI reads the same manifest automatically; compatibility-test matrices explicitly
override Node.js. pnpm runtime management is disabled so it does not override
Vite+'s selection. Keep any consumer-facing `engines.node` support range separate
from the development pin.
