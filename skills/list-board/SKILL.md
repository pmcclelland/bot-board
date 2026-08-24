---
name: list-board
description: >
  Read and show the shared Bot Board kanban. Use when the user asks what is on
  the board, to list To Do / Doing / Done, review current work, or inspect
  projects and tasks before changing anything.
---

# List Board

Show the live shared board. This is a read-only skill.

## When to use

- "What's on the board?"
- "Show To Do / Doing / Done"
- Before creating, moving, or editing work

## How

1. Call the board-read tool on the connected **BotBoard** connector (typically
   `list_board`). Look up the live tool list; do not invent ids or columns.
2. Summarize by lane: To Do, Doing, Done.
3. Include title, lane, project (if any), creator, assignee, and id so later
   actions can reuse real ids. Use `people` when assigning later.
4. If the user asked about one project or one person, filter after you have
   the snapshot.

Do not create, move, edit, or delete from this skill.
