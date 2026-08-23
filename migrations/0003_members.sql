-- Access control for the shared board. Sign-in is not enough — a member row
-- must be approved. The first signed-in user (or BOARD_ADMIN_EMAILS) becomes admin.

create table if not exists members (
  user_id text primary key,
  email text not null default '',
  name text not null default '',
  image text,
  role text not null default 'member' check (role in ('admin', 'member')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by text
);

create index if not exists members_status_idx on members (status);
create index if not exists members_email_idx on members (lower(email));
