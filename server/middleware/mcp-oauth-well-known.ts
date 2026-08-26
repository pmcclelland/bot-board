/**
 * Production safety net: serve MCP OAuth metadata (and refuse GET on
 * POST-only OAuth endpoints) so Cursor cannot receive SPA HTML.
 *
 * Clients probe both origin-root well-known URLs and the resource-path
 * form `/api/mcp/.well-known/oauth-authorization-server`.
 */
import {
  handleWellKnown,
  isOAuthWellKnownPath,
  isOauthPostOnlyPath,
  oauthMethodNotAllowed,
} from "../../src/lib/board/mcp-oauth";

interface WellKnownEvent {
  url: URL;
  req: { method: string; headers: Headers };
}

export default async function mcpOauthWellKnownMiddleware(
  event: WellKnownEvent,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const path = event.url.pathname;
  const method = (event.req.method ?? "GET").toUpperCase();

  if (isOauthPostOnlyPath(path) && method !== "POST" && method !== "OPTIONS") {
    return oauthMethodNotAllowed("POST");
  }
  if (!isOAuthWellKnownPath(path)) return next();

  const host =
    event.req.headers.get("x-forwarded-host") ??
    event.req.headers.get("host") ??
    event.url.host;
  const proto =
    event.req.headers.get("x-forwarded-proto") ??
    event.url.protocol.replace(":", "") ??
    "https";
  const request = new Request(`${proto}://${host}${event.url.pathname}${event.url.search}`, {
    method: event.req.method ?? "GET",
    headers: event.req.headers,
  });
  return handleWellKnown(request);
}
