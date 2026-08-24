---
name: manage-projects
description: >
  List, create, rename, or delete Bot Board projects. Use when grouping tasks
  under a named project, adding a project, renaming one, or removing a project
  label from the board.
---

# Manage Projects

Projects are optional labels for grouping cards. They are not a second board.

## How

1. List projects (or read the full board) before creating or renaming. Reuse an
   existing project when the name already matches. Do not invent project ids.
2. Look up project tools on the connected **BotBoard** connector (`list`,
   `create`, `rename`, `delete` — use the live names).
3. Create with a name only when none exists.
4. Rename with the real project id plus the new name.
5. Delete a project only after an explicit confirm. Cards stay on the board
   without that project; this does not delete tasks.

The token is the actor, not the chat display name.
