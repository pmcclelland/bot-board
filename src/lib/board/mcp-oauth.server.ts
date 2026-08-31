import { randomBytes } from "node:crypto";
import { getSessionUser } from "@/lib/auth/verify.server";
import { getSql } from "@/lib/db";
import { publicOrigin } from "@/lib/github/env";
import { CORS_HEADERS, corsPreflight, hashToken, type Actor } from "./actor.server";
import {
  ACCESS_TTL_MS,
  CODE_TTL_MS,
  MCP_SCOPE,
  OAUTH_ACCESS_PREFIX,
  OAUTH_CODE_PREFIX,
  OAUTH_REFRESH_PREFIX,
  REFRESH_TTL_MS,
  authorizeQueryString,
  isAllowedRedirectUri,
  normalizeScope,
  parseAuthorizeParams,
  redirectUriAllowed,
  type AuthorizeParams,
  wwwAuthenticate,
} from "./mcp-oauth";
import { verifyPkceS256 } from "./mcp-oauth-pkce";
import { requireApprovedMember } from "./members.server";
import { ServiceError } from "./service";

const OAUTH_JSON_HEADERS = {
  ...CORS_HEADERS,
  "cache-control": "no-store",
  pragma: "no-cache",
};

function oauthJson(body: unknown, status = 200) {
  return Response.json(body, { status, headers: OAUTH_JSON_HEADERS });
}

function oauthError(status: number, error: string, description?: string) {
  return oauthJson(
    description ? { error, error_description: description } : { error },
    status,
  );
}

function htmlPage(title: string, body: string, status = 400) {
  return new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)} · Bot Board</title>
    <style>
      :root { color-scheme: dark; }
      body {
        margin: 0; min-height: 100dvh; display: grid; place-items: center;
        background: #0b1014; color: #f3f0e8; font: 16px/1.5 Figtree, system-ui, sans-serif;
        padding: 24px;
      }
      main { width: min(100%, 24rem); }
      h1 { font: 600 1.5rem/1.2 Oxanium, system-ui, sans-serif; letter-spacing: 0.04em; }
      p { color: #b4b8c0; }
      a { color: #2fd3c4; }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(body)}</p>
    </main>
  </body>
</html>`,
    {
      status,
      headers: { "content-type": "text/html; charset=utf-8", ...CORS_HEADERS },
    },
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function mintSecret(prefix: string) {
  return `${prefix}${randomBytes(24).toString("base64url")}`;
}

const OAUTH_PURGE_BATCH = 500;

/** Drop used/expired codes and revoked or fully-expired tokens so the tables stay bounded. */
export async function purgeExpiredOauthArtifacts() {
  const sql = await getSql();
  await sql`
    delete from mcp_oauth_tokens
    where id in (
      select id from mcp_oauth_tokens
      where revoked_at is not null
         or (
           access_expires_at <= now()
           and (refresh_expires_at is null or refresh_expires_at <= now())
         )
      limit ${OAUTH_PURGE_BATCH}
    )
  `;
  await sql`
    delete from mcp_oauth_codes
    where id in (
      select id from mcp_oauth_codes
      where expires_at <= now()
      limit ${OAUTH_PURGE_BATCH}
    )
  `;
}

type ClientRow = {
  id: string;
  client_name: string;
  redirect_uris: string[];
};

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      /* ignore */
    }
  }
  return [];
}

async function getClient(clientId: string): Promise<ClientRow | null> {
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    client_name: string;
    redirect_uris: unknown;
  }>`
    select id, client_name, redirect_uris
    from mcp_oauth_clients
    where id = ${clientId}
    limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    client_name: row.client_name,
    redirect_uris: asStringArray(row.redirect_uris),
  };
}

function clientRedirect(params: AuthorizeParams, query: Record<string, string>) {
  const url = new URL(params.redirect_uri);
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }
  return Response.redirect(url.toString(), 302);
}

function loginUrl(origin: string, params: AuthorizeParams) {
  const next = `/oauth/authorize?${authorizeQueryString(params)}`;
  return `${origin}/login?callbackURL=${encodeURIComponent(next)}`;
}

export { handleWellKnown } from "./mcp-oauth";

export function mcpUnauthorized(request: Request) {
  const origin = publicOrigin(request);
  return new Response(JSON.stringify({ error: "Unauthorized", code: "unauthorized" }), {
    status: 401,
    headers: {
      "content-type": "application/json",
      "www-authenticate": wwwAuthenticate(origin),
      ...OAUTH_JSON_HEADERS,
    },
  });
}

export async function handleRegister(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return corsPreflight();
  if (request.method !== "POST") {
    return oauthError(405, "invalid_request", "Use POST to register a client.");
  }
  let body: Record<string, unknown> = {};
  try {
    const parsed = await request.json();
    if (parsed && typeof parsed === "object") body = parsed as Record<string, unknown>;
  } catch {
    return oauthError(400, "invalid_client_metadata", "Send JSON client metadata.");
  }

  const redirectUris = Array.isArray(body.redirect_uris)
    ? body.redirect_uris.map(String)
    : [];
  if (redirectUris.length === 0 || !redirectUris.every(isAllowedRedirectUri)) {
    return oauthError(
      400,
      "invalid_redirect_uri",
      "Register at least one https, loopback, or native-app redirect URI.",
    );
  }

  const grantTypes = Array.isArray(body.grant_types)
    ? body.grant_types.map(String)
    : ["authorization_code", "refresh_token"];
  const responseTypes = Array.isArray(body.response_types)
    ? body.response_types.map(String)
    : ["code"];
  const tokenAuth =
    typeof body.token_endpoint_auth_method === "string"
      ? body.token_endpoint_auth_method
      : "none";
  const clientName =
    typeof body.client_name === "string" ? body.client_name.trim() : "Cursor";
  const id = `mcpcli-${randomBytes(16).toString("hex")}`;
  const issuedAt = Math.floor(Date.now() / 1000);
  const sql = await getSql();
  await sql`
    insert into mcp_oauth_clients (
      id, client_name, redirect_uris, token_endpoint_auth_method, grant_types, response_types
    ) values (
      ${id}, ${clientName || "Cursor"}, ${redirectUris}, ${tokenAuth},
      ${grantTypes}, ${responseTypes}
    )
  `;

  return oauthJson(
    {
      client_id: id,
      client_id_issued_at: issuedAt,
      client_name: clientName || "Cursor",
      redirect_uris: redirectUris,
      grant_types: grantTypes,
      response_types: responseTypes,
      token_endpoint_auth_method: tokenAuth,
      scope: MCP_SCOPE,
    },
    201,
  );
}

export async function handleAuthorizeGet(request: Request): Promise<Response> {
  const origin = publicOrigin(request);
  const params = parseAuthorizeParams(new URL(request.url).searchParams);
  const checked = await validateAuthorize(params);
  if (checked instanceof Response) return checked;

  const session = await getSessionUser();
  if (!session) {
    return Response.redirect(loginUrl(origin, params), 302);
  }
  try {
    await requireApprovedMember(session.id);
  } catch (error) {
    if (error instanceof ServiceError && error.code === "pending") {
      return Response.redirect(`${origin}/waiting`, 302);
    }
    if (error instanceof ServiceError && error.code === "denied") {
      return htmlPage("Access declined", "This account cannot connect Cursor to Bot Board.");
    }
    throw error;
  }

  const consent = new URL("/oauth/consent", `${origin}/`);
  consent.search = authorizeQueryString(params);
  if (checked.client.client_name) {
    consent.searchParams.set("client_name", checked.client.client_name);
  }
  return Response.redirect(consent.toString(), 302);
}

async function validateAuthorize(
  params: AuthorizeParams,
): Promise<{ client: ClientRow } | Response> {
  if (!params.client_id) {
    return htmlPage("Cannot connect", "This sign-in request is missing a client id.");
  }
  const client = await getClient(params.client_id);
  if (!client) {
    return htmlPage("Cannot connect", "This Cursor account is not registered with Bot Board.");
  }
  if (!params.redirect_uri || !redirectUriAllowed(client.redirect_uris, params.redirect_uri)) {
    return htmlPage(
      "Cannot connect",
      "The redirect address on this sign-in request is not registered.",
    );
  }
  if (params.response_type !== "code") {
    return clientRedirect(params, {
      error: "unsupported_response_type",
      error_description: "Bot Board only supports the authorization code flow.",
      ...(params.state ? { state: params.state } : {}),
    });
  }
  if (!params.code_challenge || params.code_challenge_method !== "S256") {
    return clientRedirect(params, {
      error: "invalid_request",
      error_description: "PKCE S256 is required.",
      ...(params.state ? { state: params.state } : {}),
    });
  }
  return { client };
}

export async function handleConsentPost(request: Request): Promise<Response> {
  const origin = publicOrigin(request);
  const form = await request.formData();
  const decision = String(form.get("decision") ?? "");
  const params = parseAuthorizeParams({
    client_id: String(form.get("client_id") ?? ""),
    redirect_uri: String(form.get("redirect_uri") ?? ""),
    response_type: String(form.get("response_type") ?? "code"),
    code_challenge: String(form.get("code_challenge") ?? ""),
    code_challenge_method: String(form.get("code_challenge_method") ?? "S256"),
    state: String(form.get("state") ?? ""),
    scope: String(form.get("scope") ?? MCP_SCOPE),
    resource: String(form.get("resource") ?? ""),
  });

  const checked = await validateAuthorize(params);
  if (checked instanceof Response) return checked;

  if (decision === "deny") {
    return clientRedirect(params, {
      error: "access_denied",
      error_description: "The account declined this connection.",
      ...(params.state ? { state: params.state } : {}),
    });
  }
  if (decision !== "allow") {
    return htmlPage("Cannot connect", "Choose Allow or Deny.");
  }

  const session = await getSessionUser();
  if (!session) {
    return Response.redirect(loginUrl(origin, params), 302);
  }
  try {
    await requireApprovedMember(session.id);
  } catch (error) {
    if (error instanceof ServiceError) {
      return htmlPage("Cannot connect", error.message);
    }
    throw error;
  }

  const code = mintSecret(OAUTH_CODE_PREFIX);
  const id = `mccid-${crypto.randomUUID()}`;
  const sql = await getSql();
  await sql`
    insert into mcp_oauth_codes (
      id, code_hash, client_id, user_id, redirect_uri, code_challenge,
      code_challenge_method, scope, resource, expires_at
    ) values (
      ${id}, ${hashToken(code)}, ${params.client_id}, ${session.id},
      ${params.redirect_uri}, ${params.code_challenge}, ${params.code_challenge_method},
      ${normalizeScope(params.scope)}, ${params.resource || null},
      ${new Date(Date.now() + CODE_TTL_MS).toISOString()}
    )
  `;

  return clientRedirect(params, {
    code,
    ...(params.state ? { state: params.state } : {}),
  });
}

async function readTokenBody(request: Request): Promise<Record<string, string>> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const parsed = await request.json();
      if (parsed && typeof parsed === "object") {
        return Object.fromEntries(
          Object.entries(parsed as Record<string, unknown>).map(([key, value]) => [
            key,
            typeof value === "string" ? value : String(value ?? ""),
          ]),
        );
      }
    } catch {
      return {};
    }
    return {};
  }
  const text = await request.text();
  const params = new URLSearchParams(text);
  return Object.fromEntries(params.entries());
}

export async function handleToken(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return corsPreflight();
  if (request.method !== "POST") {
    return oauthError(405, "invalid_request", "Use POST to exchange a token.");
  }
  const body = await readTokenBody(request);
  const grantType = body.grant_type ?? "";
  if (grantType === "authorization_code") return exchangeAuthorizationCode(body);
  if (grantType === "refresh_token") return exchangeRefreshToken(body);
  return oauthError(400, "unsupported_grant_type", "Use authorization_code or refresh_token.");
}

async function exchangeAuthorizationCode(body: Record<string, string>) {
  const code = body.code?.trim() ?? "";
  const redirectUri = body.redirect_uri?.trim() ?? "";
  const verifier = body.code_verifier?.trim() ?? "";
  const clientId = body.client_id?.trim() ?? "";
  if (!code || !redirectUri || !verifier) {
    return oauthError(400, "invalid_request", "code, redirect_uri, and code_verifier are required.");
  }
  if (!code.startsWith(OAUTH_CODE_PREFIX)) {
    return oauthError(400, "invalid_grant", "Unknown authorization code.");
  }

  const sql = await getSql();
  const rows = await sql<{
    id: string;
    client_id: string;
    user_id: string;
    redirect_uri: string;
    code_challenge: string;
    code_challenge_method: string;
    scope: string;
    resource: string | null;
    expires_at: string | Date;
    used_at: string | Date | null;
  }>`
    select id, client_id, user_id, redirect_uri, code_challenge, code_challenge_method,
           scope, resource, expires_at, used_at
    from mcp_oauth_codes
    where code_hash = ${hashToken(code)}
    limit 1
  `;
  const row = rows[0];
  if (!row) return oauthError(400, "invalid_grant", "Unknown authorization code.");
  if (clientId && clientId !== row.client_id) {
    return oauthError(400, "invalid_grant", "client_id does not match this code.");
  }
  if (row.redirect_uri !== redirectUri) {
    return oauthError(400, "invalid_grant", "redirect_uri does not match this code.");
  }
  if (row.used_at) {
    await sql`delete from mcp_oauth_tokens where code_id = ${row.id}`;
    return oauthError(400, "invalid_grant", "Authorization code already used.");
  }
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    return oauthError(400, "invalid_grant", "Authorization code expired.");
  }
  if (row.code_challenge_method !== "S256" || !verifyPkceS256(verifier, row.code_challenge)) {
    return oauthError(400, "invalid_grant", "PKCE verification failed.");
  }

  await sql`update mcp_oauth_codes set used_at = now() where id = ${row.id}`;
  return issueTokens({
    codeId: row.id,
    clientId: row.client_id,
    userId: row.user_id,
    scope: row.scope,
    resource: row.resource,
  });
}

async function exchangeRefreshToken(body: Record<string, string>) {
  const refresh = body.refresh_token?.trim() ?? "";
  if (!refresh.startsWith(OAUTH_REFRESH_PREFIX)) {
    return oauthError(400, "invalid_grant", "Unknown refresh token.");
  }
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    client_id: string;
    user_id: string;
    scope: string;
    resource: string | null;
    refresh_expires_at: string | Date | null;
    revoked_at: string | Date | null;
  }>`
    select id, client_id, user_id, scope, resource, refresh_expires_at, revoked_at
    from mcp_oauth_tokens
    where refresh_hash = ${hashToken(refresh)}
    limit 1
  `;
  const row = rows[0];
  if (!row || row.revoked_at) {
    return oauthError(400, "invalid_grant", "Unknown refresh token.");
  }
  if (row.refresh_expires_at && new Date(row.refresh_expires_at).getTime() <= Date.now()) {
    return oauthError(400, "invalid_grant", "Refresh token expired.");
  }
  await sql`delete from mcp_oauth_tokens where id = ${row.id}`;
  return issueTokens({
    codeId: null,
    clientId: row.client_id,
    userId: row.user_id,
    scope: row.scope,
    resource: row.resource,
  });
}

async function issueTokens(input: {
  codeId: string | null;
  clientId: string;
  userId: string;
  scope: string;
  resource: string | null;
}) {
  const access = mintSecret(OAUTH_ACCESS_PREFIX);
  const refresh = mintSecret(OAUTH_REFRESH_PREFIX);
  const id = `mcptok-${crypto.randomUUID()}`;
  const sql = await getSql();
  await sql`
    insert into mcp_oauth_tokens (
      id, code_id, access_hash, refresh_hash, client_id, user_id, scope, resource,
      access_expires_at, refresh_expires_at
    ) values (
      ${id}, ${input.codeId}, ${hashToken(access)}, ${hashToken(refresh)},
      ${input.clientId}, ${input.userId}, ${input.scope}, ${input.resource},
      ${new Date(Date.now() + ACCESS_TTL_MS).toISOString()},
      ${new Date(Date.now() + REFRESH_TTL_MS).toISOString()}
    )
  `;
  await purgeExpiredOauthArtifacts();
  return oauthJson({
    access_token: access,
    token_type: "Bearer",
    expires_in: Math.floor(ACCESS_TTL_MS / 1000),
    refresh_token: refresh,
    scope: input.scope,
  });
}

export async function handleRevoke(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return corsPreflight();
  if (request.method !== "POST") {
    return oauthError(405, "invalid_request", "Use POST to revoke a token.");
  }
  const body = await readTokenBody(request);
  const token = body.token?.trim() ?? "";
  if (!token) return new Response(null, { status: 200, headers: OAUTH_JSON_HEADERS });
  const sql = await getSql();
  const hashed = hashToken(token);
  await sql`
    delete from mcp_oauth_tokens
    where access_hash = ${hashed} or refresh_hash = ${hashed}
  `;
  return new Response(null, { status: 200, headers: OAUTH_JSON_HEADERS });
}

export async function resolveOauthAccessActor(token: string): Promise<Actor | null> {
  if (!token.startsWith(OAUTH_ACCESS_PREFIX)) return null;
  const sql = await getSql();
  const rows = await sql<{
    user_id: string;
    access_expires_at: string | Date;
    revoked_at: string | Date | null;
  }>`
    select user_id, access_expires_at, revoked_at
    from mcp_oauth_tokens
    where access_hash = ${hashToken(token)}
    limit 1
  `;
  const row = rows[0];
  if (!row || row.revoked_at) return null;
  if (new Date(row.access_expires_at).getTime() <= Date.now()) return null;
  return { userId: row.user_id, email: null };
}

