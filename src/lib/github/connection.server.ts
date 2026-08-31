import { getSql } from "@/lib/db";
import { GithubAuthError, refreshGithubToken, type GithubToken } from "./api";
import { decryptSecret, encryptSecret } from "./crypto";
import { WORKSPACE_CONNECTION_ID } from "./env";
import type {
  GithubConnectionPublic,
  GithubConnectionStatus,
} from "./types";

export type { GithubConnectionPublic, GithubConnectionStatus };

export type GithubConnectionRow = {
  id: string;
  githubUserId: string;
  login: string;
  avatarUrl: string | null;
  accessTokenEncrypted: string;
  refreshTokenEncrypted: string | null;
  tokenExpiresAt: string | null;
  scopes: string;
  status: GithubConnectionStatus;
  connectedBy: string;
  connectedAt: string;
  updatedAt: string;
  lastSyncedAt: string | null;
};

type ConnectionSql = {
  id: string;
  github_user_id: string;
  login: string;
  avatar_url: string | null;
  access_token_encrypted: string;
  refresh_token_encrypted: string | null;
  token_expires_at: string | Date | null;
  scopes: string;
  status: string;
  connected_by: string;
  connected_at: string | Date;
  updated_at: string | Date;
  last_synced_at: string | Date | null;
};

function toIso(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function mapConnection(row: ConnectionSql): GithubConnectionRow {
  return {
    id: row.id,
    githubUserId: row.github_user_id,
    login: row.login,
    avatarUrl: row.avatar_url,
    accessTokenEncrypted: row.access_token_encrypted,
    refreshTokenEncrypted: row.refresh_token_encrypted,
    tokenExpiresAt: toIso(row.token_expires_at),
    scopes: row.scopes,
    status: row.status === "broken" ? "broken" : "connected",
    connectedBy: row.connected_by,
    connectedAt: toIso(row.connected_at) ?? new Date().toISOString(),
    updatedAt: toIso(row.updated_at) ?? new Date().toISOString(),
    lastSyncedAt: toIso(row.last_synced_at),
  };
}

export type GithubConnectionPublicFields = {
  login: string;
  avatarUrl: string | null;
  status: GithubConnectionStatus;
  connectedAt: string;
};

export function toPublicConnection(
  configured: boolean,
  row: GithubConnectionPublicFields | null,
): GithubConnectionPublic {
  if (!row) {
    return {
      configured,
      connected: false,
      login: null,
      avatarUrl: null,
      status: null,
      connectedAt: null,
    };
  }
  return {
    configured,
    connected: true,
    login: row.login,
    avatarUrl: row.avatarUrl,
    status: row.status,
    connectedAt: row.connectedAt,
  };
}

export async function getWorkspaceConnection(): Promise<GithubConnectionRow | null> {
  const sql = await getSql();
  const rows = await sql<ConnectionSql>`
    select
      id, github_user_id, login, avatar_url,
      access_token_encrypted, refresh_token_encrypted, token_expires_at,
      scopes, status, connected_by, connected_at, updated_at, last_synced_at
    from github_connections
    where id = ${WORKSPACE_CONNECTION_ID}
    limit 1
  `;
  return rows[0] ? mapConnection(rows[0]) : null;
}

/** last_synced_at only — used to skip GitHub sync without pulling encrypted tokens. */
export async function getWorkspaceConnectionSyncMeta(): Promise<{
  lastSyncedAt: string | null;
} | null> {
  const sql = await getSql();
  const rows = await sql<{ last_synced_at: string | Date | null }>`
    select last_synced_at
    from github_connections
    where id = ${WORKSPACE_CONNECTION_ID}
    limit 1
  `;
  if (!rows[0]) return null;
  return { lastSyncedAt: toIso(rows[0].last_synced_at) };
}

/** Public GitHub connection fields — no encrypted tokens on the board-load path. */
export async function getWorkspaceConnectionPublic(): Promise<GithubConnectionPublicFields | null> {
  const sql = await getSql();
  const rows = await sql<{
    login: string;
    avatar_url: string | null;
    status: string;
    connected_at: string | Date;
  }>`
    select login, avatar_url, status, connected_at
    from github_connections
    where id = ${WORKSPACE_CONNECTION_ID}
    limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    login: row.login,
    avatarUrl: row.avatar_url,
    status: row.status === "broken" ? "broken" : "connected",
    connectedAt: toIso(row.connected_at) ?? new Date().toISOString(),
  };
}

export async function replaceWorkspaceConnection(input: {
  githubUserId: string;
  login: string;
  avatarUrl: string | null;
  token: GithubToken;
  connectedBy: string;
}): Promise<GithubConnectionRow> {
  const sql = await getSql();
  const access = encryptSecret(input.token.accessToken);
  const refresh = input.token.refreshToken
    ? encryptSecret(input.token.refreshToken)
    : null;
  const expiresAt = input.token.expiresAt?.toISOString() ?? null;
  const rows = await sql<ConnectionSql>`
    insert into github_connections (
      id, github_user_id, login, avatar_url,
      access_token_encrypted, refresh_token_encrypted, token_expires_at,
      scopes, status, connected_by, connected_at, updated_at, last_synced_at
    ) values (
      ${WORKSPACE_CONNECTION_ID}, ${input.githubUserId}, ${input.login},
      ${input.avatarUrl}, ${access}, ${refresh}, ${expiresAt},
      ${input.token.scopes}, ${"connected"}, ${input.connectedBy},
      now(), now(), null
    )
    on conflict (id) do update set
      github_user_id = excluded.github_user_id,
      login = excluded.login,
      avatar_url = excluded.avatar_url,
      access_token_encrypted = excluded.access_token_encrypted,
      refresh_token_encrypted = excluded.refresh_token_encrypted,
      token_expires_at = excluded.token_expires_at,
      scopes = excluded.scopes,
      status = excluded.status,
      connected_by = excluded.connected_by,
      connected_at = now(),
      updated_at = now(),
      last_synced_at = null
    returning
      id, github_user_id, login, avatar_url,
      access_token_encrypted, refresh_token_encrypted, token_expires_at,
      scopes, status, connected_by, connected_at, updated_at, last_synced_at
  `;
  if (!rows[0]) throw new Error("Could not store GitHub connection.");
  return mapConnection(rows[0]);
}

export async function deleteWorkspaceConnection() {
  const sql = await getSql();
  await sql`delete from github_connections where id = ${WORKSPACE_CONNECTION_ID}`;
}

export async function markConnectionBroken() {
  const sql = await getSql();
  await sql`
    update github_connections
    set status = 'broken', updated_at = now()
    where id = ${WORKSPACE_CONNECTION_ID}
  `;
}

export async function markConnectionSynced() {
  const sql = await getSql();
  await sql`
    update github_connections
    set last_synced_at = now(), status = 'connected', updated_at = now()
    where id = ${WORKSPACE_CONNECTION_ID}
  `;
}

export async function updateStoredToken(token: GithubToken) {
  const sql = await getSql();
  const access = encryptSecret(token.accessToken);
  const refresh = token.refreshToken ? encryptSecret(token.refreshToken) : null;
  const expiresAt = token.expiresAt?.toISOString() ?? null;
  await sql`
    update github_connections set
      access_token_encrypted = ${access},
      refresh_token_encrypted = ${refresh},
      token_expires_at = ${expiresAt},
      scopes = ${token.scopes},
      status = 'connected',
      updated_at = now()
    where id = ${WORKSPACE_CONNECTION_ID}
  `;
}

async function persistRefreshedToken(
  token: GithubToken,
  previous: GithubConnectionRow,
) {
  await updateStoredToken({
    ...token,
    refreshToken: token.refreshToken ?? decryptRefresh(previous),
    scopes: token.scopes || previous.scopes,
  });
}

function decryptRefresh(row: GithubConnectionRow): string | null {
  if (!row.refreshTokenEncrypted) return null;
  return decryptSecret(row.refreshTokenEncrypted);
}

const EXPIRY_SKEW_MS = 60_000;

export async function resolveAccessToken(
  row: GithubConnectionRow,
): Promise<string> {
  const expiresAt = row.tokenExpiresAt ? Date.parse(row.tokenExpiresAt) : NaN;
  const expired =
    Number.isFinite(expiresAt) && expiresAt - EXPIRY_SKEW_MS <= Date.now();
  if (!expired) {
    return decryptSecret(row.accessTokenEncrypted);
  }
  const refresh = decryptRefresh(row);
  if (!refresh) throw new GithubAuthError();
  const next = await refreshGithubToken(refresh);
  await persistRefreshedToken(next, row);
  return next.accessToken;
}
