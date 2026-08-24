-- Tasks remember who filed them (created_by already exists) and who they are
-- assigned to. Assignee is a member user_id; the UI shows members.name.

alter table tasks add column if not exists assignee_id text;

create index if not exists tasks_assignee_id_idx on tasks (assignee_id);
