/** Read an env var, treating empty/whitespace as unset. */
export function env(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
}

export function githubOAuthConfigured() {
  return Boolean(env("GITHUB_CLIENT_ID") && env("GITHUB_CLIENT_SECRET"));
}

export const GITHUB_OAUTH_SCOPES = ["read:user", "repo"] as const;

export const WORKSPACE_CONNECTION_ID = "workspace";

export function publicOrigin(request: Request): string {
  const configured = env("BETTER_AUTH_URL");
  if (configured) return configured.replace(/\/+$/, "");
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? url.host;
  const proto =
    request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return `${proto}://${host}`;
}

export function githubCallbackUrl(request: Request) {
  return `${publicOrigin(request)}/api/github/callback`;
}
