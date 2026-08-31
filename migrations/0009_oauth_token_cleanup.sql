-- Drop accumulated MCP OAuth leftovers. Live access/refresh pairs stay.
-- Ongoing cleanup also runs from purgeExpiredOauthArtifacts() on token issue.

delete from mcp_oauth_tokens
where revoked_at is not null
   or (
     access_expires_at <= now()
     and (refresh_expires_at is null or refresh_expires_at <= now())
   );

delete from mcp_oauth_codes
where expires_at <= now();
