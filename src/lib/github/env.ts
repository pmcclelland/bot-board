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

function firstForwarded(value: string | null): string | undefined {
  const part = value?.split(",")[0]?.trim();
  return part || undefined;
}

function hostname(value: string) {
  return value.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

function isLoopbackHost(host: string) {
  return /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(host);
}

/**
 * Origin of the incoming request — preview stays on the preview host, prod on
 * botboard.pmcclel.land. Never use BETTER_AUTH_URL here: that is the sign-in
 * broker origin and would send GitHub OAuth back to production from a preview.
 */
export function publicOrigin(request: Request): string {
  const url = new URL(request.url);
  const forwardedHost = firstForwarded(request.headers.get("x-forwarded-host"));
  const vercelHost = env("VERCEL_URL") ? hostname(env("VERCEL_URL") as string) : undefined;
  const host =
    forwardedHost ??
    (!isLoopbackHost(url.host) ? url.host : undefined) ??
    vercelHost ??
    url.host;
  const forwardedProto = firstForwarded(request.headers.get("x-forwarded-proto"));
  const proto =
    forwardedProto ??
    (host === url.host ? url.protocol.replace(":", "") : "https");
  return `${proto}://${host}`;
}

export function githubCallbackUrl(request: Request) {
  return `${publicOrigin(request)}/api/github/callback`;
}
