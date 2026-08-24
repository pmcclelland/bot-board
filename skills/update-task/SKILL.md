---
name: update-task
description: >
  Edit or delete a Bot Board task. Use when changing title, description, link,
  tags, project, assignee, or lane, or when asked to delete / remove a card.
  Deleting requires an explicit confirm.
---

# Update Task

Edit an existing card, or delete it only after the user confirms.

## Edit

1. Read the board (or fetch the task) first. Use the real task id.
2. Send only the fields that should change. Look up the live update tool on the
   connected **BotBoard** connector. Assignee is a member name from `people`;
   empty string unassigns. Do not send a creator field.
3. The token is the actor (`updatedBy`), not the chat display name.
4. Confirm what changed.

## Delete

1. Identify the task with a real id from the board.
2. **Do not delete unless the user explicitly confirms** that this specific
   card should be removed (name it). "Clean up" or "update" is not enough.
3. After confirm, call the delete tool on the connected **BotBoard** connector.
4. Say that it was deleted.

Prefer moving to `done` over deleting unless the user wants it gone.
