---
name: move-task
description: >
  Move a Bot Board task between To Do, Doing, and Done. Use when starting work,
  marking a task done, changing lanes, or asking to put something in todo /
  doing / done.
---

# Move Task

Change a card's lane on the shared board.

## Lanes

- `todo` — not started
- `doing` — in progress (move here when you start)
- `done` — shipped

## How

1. Read the board first. Resolve the task by title only if the match is unique;
   otherwise ask. Use the real task id. Do not invent ids.
2. Call the move tool on the connected **BotBoard** connector with that id and
   the target `columnId`. Look up the live tool for optional project / order
   fields.
3. Confirm the new lane.

The token is the actor (`updatedBy`), not the chat display name.
