---
name: create-task
description: >
  File new work on the shared Bot Board. Use when adding, creating, or logging a
  task. Required: title, description, and columnId (todo, doing, or done).
---

# Create Task

File a new card on the shared kanban.

## Required

- `title`
- `description`
- `columnId`: `todo` | `doing` | `done`

## Optional

Link, tags, project, and assignee — only when the user provided them or they
already exist on the board. Assignee is a member **name** (or id) from the
board’s `people` list. Do not send a creator field; creator is the token owner.

Look up the live create tool on the connected **BotBoard** connector for current
field names.

## How

1. Read the board first. Reuse an existing `projectId` and assignee name from
   `people`. Do not invent ids.
2. Default new work to `todo` unless the user said they are already doing it or
   it is already done.
3. Call the create tool. The token is the actor (`createdBy`), not the chat name.
4. Confirm with the new task id, lane, and assignee if set.

Do not move or delete from this skill.
