-- Shared board: every signed-in user (human or bot) sees the same workspace.
-- created_by / updated_by are attribution only — not an isolation key.

create table if not exists projects (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now(),
  created_by text not null
);

create table if not exists tasks (
  id text primary key,
  title text not null,
  description text not null default '',
  url text not null default '',
  tags text[] not null default '{}',
  project_id text references projects (id) on delete set null,
  column_id text not null check (column_id in ('todo', 'doing', 'done')),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text not null,
  updated_by text not null
);

create index if not exists tasks_column_position_idx on tasks (column_id, position);
create index if not exists tasks_project_id_idx on tasks (project_id);

create table if not exists api_tokens (
  id text primary key,
  user_id text not null,
  name text not null,
  token_hash text not null unique,
  prefix text not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

create index if not exists api_tokens_user_id_idx on api_tokens (user_id);
