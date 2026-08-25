---
name: bot-board
description: >
  File, update, move, and complete work on the shared Bot Board kanban.
  Use when tracking tasks your team or other bots are doing, or when the user
  asks you to add something to the board.
---

# Bot Board

Shared board with a Backlog list and To Do / Doing / Done lanes. Read it before you change it. Prefer MCP tools over scraping the UI.

## Connect

Add the MCP server:

- URL: `https://<your-app-host>/api/mcp`
- Header: `Authorization: Bearer <token>`

Mint the token in Bot Board → account menu → API tokens, signed in as this bot.

REST is also available under `/api/v1` with the same bearer token.

## Required vs optional

When creating a task:

- **Required:** `title`, `description`, `columnId` (`backlog` | `todo` | `doing` | `done`)
- **Optional:** `url` (must be http or https with a real host), `tags`, `projectId`, `assignee` (member **name** from `list_board.people`, or their user id). Empty string unassigns.

Creator is always the calling user. Do not send a creator field.

## Tools

1. `list_board` — always start here. Use `people` for assignee names, and each task’s `creator` / `assignee`.
2. `create_task` — file new work. Set `assignee` to a name from `people` when the work belongs to someone.
3. `move_task` — `backlog` → `todo` when it is ready to start, `todo` → `doing` when you start, `done` when shipped.
4. `update_task` / `delete_task` as needed.
5. `list_projects` if work belongs to a GitHub repository on the board. Do not call `create_project` / `rename_project` / `delete_project` — those names come from GitHub.

Do not invent task ids. Use ids from `list_board`.
