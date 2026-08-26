/**
 * Production safety net: serve MCP OAuth metadata at the origin root even if
 * file-route matching for `/.well-known/*` is skipped. Cursor probes these
 * URLs and treats HTML/404 as a failed OAuth load.
 */
interface WellKnownEvent {
  url: URL;
  req: { method: string; headers: Headers };
}

function isOAuthWellKnown(path: string) {
  const normalized = path.replace(/\/+$/, "") || "/";
  return (
    normalized === "/.well-known/oauth-authorization-server" ||
    normalized === "/.well-known/oauth-authorization-server/api/mcp" ||
    normalized === "/.well-known/oauth-protected-resource" ||
    normalized === "/.well-known/oauth-protected-resource/api/mcp" ||
    normalized === "/.well-known/openid-configuration" ||
    normalized === "/.well-known/openid-configuration/api/mcp"
  );
}

export default async function mcpOauthWellKnownMiddleware(
  event: WellKnownEvent,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  if (!isOAuthWellKnown(event.url.pathname)) return next();

  const { handleWellKnown } = await import("../../src/lib/board/mcp-oauth");
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
