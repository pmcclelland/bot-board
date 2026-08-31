import { publicOrigin } from "../github/env.ts";

export const MCP_PATH = "/api/mcp";
export const MCP_SCOPE = "board";
export const OAUTH_ACCESS_PREFIX = "mcp_";
export const OAUTH_REFRESH_PREFIX = "mcr_";
export const OAUTH_CODE_PREFIX = "mcc_";

export const CODE_TTL_MS = 10 * 60 * 1000;
export const ACCESS_TTL_MS = 60 * 60 * 1000;
export const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type OauthTokenExpiry = {
  revokedAt?: string | Date | null;
  accessExpiresAt: string | Date;
  refreshExpiresAt?: string | Date | null;
};

export type OauthCodeExpiry = {
  usedAt?: string | Date | null;
  expiresAt: string | Date;
};

/** True when a token row can be deleted: revoked, or access and refresh both past. */
export function isDeadOauthToken(row: OauthTokenExpiry, now = Date.now()): boolean {
  if (row.revokedAt) return true;
  if (new Date(row.accessExpiresAt).getTime() > now) return false;
  if (!row.refreshExpiresAt) return true;
  return new Date(row.refreshExpiresAt).getTime() <= now;
}

/** True when an auth code's TTL elapsed. Used codes stay until then for replay detection. */
export function isDeadOauthCode(row: OauthCodeExpiry, now = Date.now()): boolean {
  return new Date(row.expiresAt).getTime() <= now;
}

export const OAUTH_CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers":
    "authorization, content-type, mcp-protocol-version, mcp-session-id",
  "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "access-control-expose-headers": "www-authenticate",
  "cache-control": "no-store",
  pragma: "no-cache",
};

export type AuthorizeParams = {
  client_id: string;
  redirect_uri: string;
  response_type: string;
  code_challenge: string;
  code_challenge_method: string;
  state: string;
  scope: string;
  resource: string;
};

export function parseAuthorizeParams(
  input: URLSearchParams | Record<string, string | undefined>,
): AuthorizeParams {
  const get =
    input instanceof URLSearchParams
      ? (key: string) => input.get(key) ?? ""
      : (key: string) => input[key] ?? "";
  return {
    client_id: get("client_id").trim(),
    redirect_uri: get("redirect_uri").trim(),
    response_type: get("response_type").trim() || "code",
    code_challenge: get("code_challenge").trim(),
    code_challenge_method: get("code_challenge_method").trim() || "S256",
    state: get("state"),
    scope: get("scope").trim() || MCP_SCOPE,
    resource: get("resource").trim(),
  };
}

export function authorizeQueryString(params: AuthorizeParams): string {
  const search = new URLSearchParams();
  search.set("client_id", params.client_id);
  search.set("redirect_uri", params.redirect_uri);
  search.set("response_type", params.response_type);
  search.set("code_challenge", params.code_challenge);
  search.set("code_challenge_method", params.code_challenge_method);
  if (params.state) search.set("state", params.state);
  if (params.scope) search.set("scope", params.scope);
  if (params.resource) search.set("resource", params.resource);
  return search.toString();
}

export function authorizationServerMetadata(origin: string) {
  const issuer = origin.replace(/\/+$/, "");
  return {
    issuer,
    authorization_endpoint: `${issuer}/oauth/authorize`,
    token_endpoint: `${issuer}/oauth/token`,
    registration_endpoint: `${issuer}/oauth/register`,
    revocation_endpoint: `${issuer}/oauth/revoke`,
    scopes_supported: [MCP_SCOPE],
    response_types_supported: ["code"],
    response_modes_supported: ["query"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    token_endpoint_auth_methods_supported: ["none", "client_secret_post"],
    code_challenge_methods_supported: ["S256"],
  };
}

export function protectedResourceMetadata(origin: string) {
  const issuer = origin.replace(/\/+$/, "");
  return {
    resource: `${issuer}${MCP_PATH}`,
    authorization_servers: [issuer],
    bearer_methods_supported: ["header"],
    scopes_supported: [MCP_SCOPE],
  };
}

const AUTH_SERVER_PATHS = new Set([
  "/.well-known/oauth-authorization-server",
  "/.well-known/oauth-authorization-server/api/mcp",
  "/.well-known/openid-configuration",
  "/.well-known/openid-configuration/api/mcp",
  "/api/mcp/.well-known/oauth-authorization-server",
  "/api/mcp/.well-known/openid-configuration",
]);

const PROTECTED_RESOURCE_PATHS = new Set([
  "/.well-known/oauth-protected-resource",
  "/.well-known/oauth-protected-resource/api/mcp",
  "/api/mcp/.well-known/oauth-protected-resource",
]);

export const OAUTH_POST_ONLY_PATHS = [
  "/oauth/token",
  "/oauth/register",
  "/oauth/revoke",
  "/oauth/decision",
] as const;

export function normalizePathname(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

/** True when a client is probing OAuth metadata — never fall through to HTML. */
export function isOAuthWellKnownPath(pathname: string) {
  const path = normalizePathname(pathname);
  return (
    path.startsWith("/.well-known/oauth-") ||
    path.startsWith("/.well-known/openid-configuration") ||
    path.startsWith("/api/mcp/.well-known/")
  );
}

export function isOauthPostOnlyPath(pathname: string) {
  return (OAUTH_POST_ONLY_PATHS as readonly string[]).includes(
    normalizePathname(pathname),
  );
}

export function wellKnownKind(
  pathname: string,
): "authorization-server" | "protected-resource" | "not-found" {
  const path = normalizePathname(pathname);
  if (AUTH_SERVER_PATHS.has(path)) return "authorization-server";
  if (PROTECTED_RESOURCE_PATHS.has(path)) return "protected-resource";
  return "not-found";
}

export function oauthMethodNotAllowed(allowed = "POST") {
  return Response.json(
    { error: "invalid_request", error_description: `Use ${allowed}.` },
    { status: 405, headers: { ...OAUTH_CORS_HEADERS, allow: allowed } },
  );
}

export function isLoopbackHost(hostname: string) {
  const host = hostname.toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "::1";
}

export function isAllowedRedirectUri(uri: string): boolean {
  try {
    const url = new URL(uri);
    const protocol = url.protocol.toLowerCase();
    if (protocol === "javascript:" || protocol === "data:" || protocol === "file:") {
      return false;
    }
    if (protocol === "https:") return true;
    if (protocol === "http:") return isLoopbackHost(url.hostname);
    return /^[a-z][a-z0-9+.-]*:$/.test(protocol);
  } catch {
    return false;
  }
}

export function redirectUriAllowed(registered: string[], requested: string) {
  return registered.includes(requested);
}

export function normalizeScope(scope: string) {
  const parts = scope
    .split(/[\s,]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return MCP_SCOPE;
  if (!parts.includes(MCP_SCOPE)) parts.unshift(MCP_SCOPE);
  return [...new Set(parts)].join(" ");
}

export function wwwAuthenticate(origin: string) {
  const issuer = origin.replace(/\/+$/, "");
  const metadata = `${issuer}/.well-known/oauth-protected-resource${MCP_PATH}`;
  return `Bearer realm="Bot Board", resource_metadata="${metadata}", scope="${MCP_SCOPE}"`;
}

export function handleWellKnown(request: Request): Response {
  const cors = {
    ...OAUTH_CORS_HEADERS,
  };
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    return Response.json(
      { error: "invalid_request", error_description: "Method not allowed." },
      { status: 405, headers: cors },
    );
  }
  const origin = publicOrigin(request);
  const kind = wellKnownKind(new URL(request.url).pathname);
  if (kind === "authorization-server") {
    return Response.json(authorizationServerMetadata(origin), { headers: cors });
  }
  if (kind === "protected-resource") {
    return Response.json(protectedResourceMetadata(origin), { headers: cors });
  }
  return Response.json(
    { error: "not_found", error_description: "Unknown metadata document." },
    { status: 404, headers: cors },
  );
}
