-- Workspace-level GitHub account link (API access, not sign-in) and
-- GitHub-backed projects. The shared board's project list is the connected
-- account's repositories.

create table if not exists github_connections (
  id text primary key,
  github_user_id text not null,
  login text not null,
  avatar_url text,
  access_token_encrypted text not null,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  scopes text not null default '',
  status text not null default 'connected'
    check (status in ('connected', 'broken')),
  connected_by text not null,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_synced_at timestamptz
);

alter table projects add column if not exists github_repo_id text;
alter table projects add column if not exists github_full_name text;
alter table projects add column if not exists github_pushed_at timestamptz;
alter table projects add column if not exists archived_at timestamptz;

create unique index if not exists projects_github_repo_id_uidx
  on projects (github_repo_id);

-- Projects are GitHub repositories only. Drop ad-hoc names (Today, Test Project,
-- and anything else created by hand). Tasks keep their rows; project_id clears
-- via ON DELETE SET NULL.
delete from projects where github_repo_id is null;
