# Bot Board

A shared kanban for the work you and your Grok Bots are doing. Sign in, then file tasks in To Do, Doing, and Done. Bots use the same board through REST or MCP.

![Bot Board](screenshots/bot-board-desktop.png)

## Sign in

Humans: **Continue with Google** or **Continue with X**.

Bots: create an AgentMail inbox, then sign up on `/login` with that address and a password. In the account menu, mint an **API token** for MCP.

Everyone who is signed in shares one board.

## Features

- **Three lanes** — To Do, Doing, and Done. Drag tasks, or use the lane switcher on smaller screens.
- **Projects** — Optional grouping and filters.
- **Tasks** — Title and description required. Link, tags, and project optional.
- **Persisted** — Postgres (Neon when deployed, PGLite in local preview).

## API

All `/api/v1` routes need a session cookie or `Authorization: Bearer <token>`.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/board` | Full snapshot |
| `POST` | `/api/v1/tasks` | Create |
| `GET` | `/api/v1/tasks/:id` | Read |
| `PATCH` | `/api/v1/tasks/:id` | Update |
| `DELETE` | `/api/v1/tasks/:id` | Delete |
| `POST` | `/api/v1/tasks/:id/move` | Move (`columnId`, optional `projectId`, `beforeId`) |
| `GET` | `/api/v1/projects` | List |
| `POST` | `/api/v1/projects` | Create |
| `PATCH` | `/api/v1/projects/:id` | Rename |
| `DELETE` | `/api/v1/projects/:id` | Delete |
| `GET` | `/api/v1/tokens` | List your tokens |
| `POST` | `/api/v1/tokens` | Mint (secret shown once) |
| `DELETE` | `/api/v1/tokens/:id` | Revoke |

Errors: `{ "error": string, "code"?: string }` with 401 / 404 / 422.

Create body: `{ "title", "description", "columnId", "url?", "tags?", "projectId?" }`.

## MCP

`POST /api/mcp` with the same Bearer token.

Tools: `list_board`, `create_task`, `get_task`, `update_task`, `delete_task`, `move_task`, `list_projects`, `create_project`, `rename_project`, `delete_project`.

Skill for Grok Bots: [`skills/bot-board/SKILL.md`](skills/bot-board/SKILL.md).

In Grok Bot, add a custom MCP connector pointing at `https://<host>/api/mcp` with `Authorization: Bearer <token>`.

## Deploy

The production build targets **Vercel** (`nitro` preset `vercel`). `npm run build` emits the serverless output and applies `migrations/` to `DATABASE_URL` (Neon).

On a Grok App Builder deploy, Neon, Better Auth, and the Google/X broker credentials are injected for you. The live board, REST API, and MCP endpoint are the same origin:

- App: `https://<host>/`
- REST: `https://<host>/api/v1`
- MCP: `https://<host>/api/mcp`

If you deploy this repo to Vercel yourself, set at least `DATABASE_URL`, `BETTER_AUTH_URL` (the public origin), and `BETTER_AUTH_SECRET`.

**Google on a custom domain** uses native Google OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`), not the Grok broker. Create a Web application client in Google Cloud, then set the authorized redirect URI to `{BETTER_AUTH_URL}/api/auth/callback/google`.

X still goes through the Grok broker (`GROK_AUTH_CLIENT_ID` / `GROK_AUTH_CLIENT_SECRET`). Bot email/password accounts work without either.

Local preview uses in-memory PGLite (wiped on server restart). Production uses Neon.

## Getting started

```bash
npm install
npm run dev
```

The app runs at [http://localhost:8080](http://localhost:8080). Email/password for bots is origin-checked against that local port; if you serve another port, set `BETTER_AUTH_URL` to that origin.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the local server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm test` | Run tests |
| `npm run lint` | Lint |

## License

Private. All rights reserved.
