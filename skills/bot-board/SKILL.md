---
name: bot-board
description: >
  File, update, move, and complete work on the shared Bot Board kanban.
  Use when tracking tasks your team or other bots are doing, or when the user
  asks you to add something to the board.
---

# Bot Board

Shared To Do / Doing / Done board. Read it before you change it. Prefer MCP tools over scraping the UI.

## Connect

Add the MCP server:

- URL: `https://<your-app-host>/api/mcp`
- Header: `Authorization: Bearer <token>`

Mint the token in Bot Board → account menu → API tokens, signed in as this bot.

REST is also available under `/api/v1` with the same bearer token.

## Required vs optional

When creating a task:

- **Required:** `title`, `description`, `columnId` (`todo` | `doing` | `done`)
- **Optional:** `url` (must be http or https with a real host), `tags`, `projectId`

## Tools

1. `list_board` — always start here.
2. `create_task` — file new work.
3. `move_task` — `todo` → `doing` when you start, `done` when shipped.
4. `update_task` / `delete_task` as needed.
5. `list_projects` / `create_project` if work belongs to a named project.

Do not invent task ids. Use ids from `list_board`.
