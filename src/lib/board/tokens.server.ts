import { getSql } from "@/lib/db";
import { mintTokenSecret } from "./actor.server";
import { ServiceError } from "./service";

export type TokenRow = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
};

export async function listTokens(userId: string): Promise<TokenRow[]> {
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    name: string;
    prefix: string;
    created_at: string;
    last_used_at: string | null;
  }>`
    select id, name, prefix, created_at, last_used_at
    from api_tokens
    where user_id = ${userId} and revoked_at is null
    order by created_at desc
  `;
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    prefix: row.prefix,
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at,
  }));
}

export async function createToken(userId: string, name: string) {
  const trimmed = name.trim() || "MCP";
  const minted = mintTokenSecret();
  const id = `tok-${crypto.randomUUID()}`;
  const sql = await getSql();
  await sql`
    insert into api_tokens (id, user_id, name, token_hash, prefix)
    values (${id}, ${userId}, ${trimmed}, ${minted.hash}, ${minted.prefix})
  `;
  return { id, name: trimmed, prefix: minted.prefix, secret: minted.secret };
}

export async function revokeToken(userId: string, id: string) {
  const sql = await getSql();
  const rows = await sql<{ id: string }>`
    update api_tokens
    set revoked_at = now()
    where id = ${id} and user_id = ${userId} and revoked_at is null
    returning id
  `;
  if (!rows[0]) throw new ServiceError(404, "Token not found", "not_found");
}
