import { createHash, randomBytes } from "node:crypto";
import { getSql } from "@/lib/db";
import { UnauthorizedError, getSessionUser } from "@/lib/auth/verify.server";

export type Actor = {
  userId: string;
  email: string | null;
};

const TOKEN_PREFIX = "bb_";

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function mintTokenSecret() {
  const secret = `${TOKEN_PREFIX}${randomBytes(24).toString("base64url")}`;
  return {
    secret,
    prefix: secret.slice(0, 10),
    hash: hashToken(secret),
  };
}

export async function requireActor(request: Request): Promise<Actor> {
  const header = request.headers.get("authorization");
  const bearer = header?.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : null;

  if (bearer?.startsWith(TOKEN_PREFIX)) {
    const sql = await getSql();
    const rows = await sql<{
      user_id: string;
      revoked_at: string | null;
    }>`select user_id, revoked_at from api_tokens where token_hash = ${hashToken(bearer)} limit 1`;
    const row = rows[0];
    if (!row || row.revoked_at) throw new UnauthorizedError();
    await sql`update api_tokens set last_used_at = now() where token_hash = ${hashToken(bearer)}`;
    return { userId: row.user_id, email: null };
  }

  if (bearer?.startsWith("mcp_")) {
    const { resolveOauthAccessActor } = await import("./mcp-oauth.server");
    const actor = await resolveOauthAccessActor(bearer);
    if (!actor) throw new UnauthorizedError();
    return actor;
  }

  const session = await getSessionUser(bearer ?? undefined);
  if (!session) throw new UnauthorizedError();
  return { userId: session.id, email: session.email };
}

/** Token-authenticated REST/MCP is called from bots, not this origin. */
export const CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers":
    "authorization, content-type, mcp-protocol-version, mcp-session-id",
  "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "access-control-expose-headers": "www-authenticate",
};

export function corsPreflight() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function jsonError(status: number, error: string, code?: string) {
  return new Response(JSON.stringify({ error, code }), {
    status,
    headers: { "content-type": "application/json", ...CORS_HEADERS },
  });
}

export function jsonOk(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...CORS_HEADERS },
  });
}
