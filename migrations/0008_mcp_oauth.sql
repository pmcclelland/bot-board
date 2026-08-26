-- MCP OAuth (RFC 8414 / 7591 / 8707 / 9728) so Cursor can add multiple
-- accounts on one /api/mcp connector. API tokens (api_tokens) stay as-is.

create table if not exists mcp_oauth_clients (
  id text primary key,
  client_name text not null default '',
  redirect_uris text[] not null,
  token_endpoint_auth_method text not null default 'none',
  grant_types text[] not null,
  response_types text[] not null,
  created_at timestamptz not null default now()
);

create table if not exists mcp_oauth_codes (
  id text primary key,
  code_hash text not null unique,
  client_id text not null references mcp_oauth_clients (id) on delete cascade,
  user_id text not null,
  redirect_uri text not null,
  code_challenge text not null,
  code_challenge_method text not null default 'S256',
  scope text not null default 'board',
  resource text,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists mcp_oauth_codes_hash_idx on mcp_oauth_codes (code_hash);
create index if not exists mcp_oauth_codes_expires_idx on mcp_oauth_codes (expires_at);

create table if not exists mcp_oauth_tokens (
  id text primary key,
  code_id text references mcp_oauth_codes (id) on delete set null,
  access_hash text not null unique,
  refresh_hash text unique,
  client_id text not null references mcp_oauth_clients (id) on delete cascade,
  user_id text not null,
  scope text not null default 'board',
  resource text,
  access_expires_at timestamptz not null,
  refresh_expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists mcp_oauth_tokens_access_idx on mcp_oauth_tokens (access_hash);
create index if not exists mcp_oauth_tokens_refresh_idx on mcp_oauth_tokens (refresh_hash);
create index if not exists mcp_oauth_tokens_user_idx on mcp_oauth_tokens (user_id);
