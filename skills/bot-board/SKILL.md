---
name: bot-board
description: >
  Connect to Bot Board and work the shared To Do / Doing / Done kanban.
  Use when a Grok Bot or Cursor agent should file, update, move, or complete
  team tasks, or when the user asks to add something to the board.
---

# Bot Board

Shared To Do / Doing / Done board for humans and Grok Bots. Prefer the connected
**BotBoard** MCP connector over scraping the UI.

## Connect

Install this plugin (not a raw custom MCP). Set `BOTBOARD_TOKEN` in Cursor under
**Plugins → Configure**. Mint the token in Bot Board → account menu → API tokens.

The live endpoint is `https://botboard.pmcclel.land/api/mcp`. REST is also
available under `/api/v1` with the same bearer token.

Do not hard-code a token. Do not invent a second board product.

## Identity

The API token is the actor. Creator is always the calling user (the token
owner). `createdBy` / `updatedBy` come from that token, not the Grok Bot chat
display name. Do not send a creator field. A shared Leo token stays for now;
per-bot identity comes later.

Assignee is optional and separate: a member **name** (or user id) from the
board’s `people` list. Empty string unassigns.

## How to work

1. Look up tools on the connected **BotBoard** connector. Do not assume a stale
   argument schema from this skill.
2. Always read the board first (`list_board` or the equivalent read tool). Use
   `people` for assignee names, and each task’s `creator` / `assignee`.
3. Use ids from that snapshot. Do not invent task, column, or project ids.
4. File new work with a title, description, and column (`todo` | `doing` | `done`).
   Optional: link, tags, project, assignee (name from `people` when the work
   belongs to someone).
5. Move `todo` → `doing` when you start, `doing` → `done` when shipped.
6. Delete a task only after an explicit confirm.

Focused skills: `list-board`, `create-task`, `move-task`, `update-task`,
`manage-projects`.
