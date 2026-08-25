-- Fourth lane. Drop the three-lane check before adding the new one.

alter table tasks drop constraint if exists tasks_column_id_check;

alter table tasks add constraint tasks_column_id_check
  check (column_id in ('backlog', 'todo', 'doing', 'done'));
