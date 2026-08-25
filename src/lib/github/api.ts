import { env, githubCallbackUrl } from "./env";

export class GithubAuthError extends Error {
  constructor(message = "GitHub access was revoked.") {
    super(message);
    this.name = "GithubAuthError";
  }
}

export type GithubUser = {
  id: number;
  login: string;
  avatar_url: string;
};

export type GithubRepo = {
  id: number;
  name: string;
  full_name: string;
  pushed_at: string | null;
  updated_at: string | null;
};

export type GithubToken = {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
  scopes: string;
};

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_token_expires_in?: number;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

const USER_AGENT = "bot-board";

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export async function exchangeGithubCode(
  request: Request,
  code: string,
): Promise<GithubToken> {
  const clientId = env("GITHUB_CLIENT_ID");
  const clientSecret = env("GITHUB_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    throw new Error("GitHub OAuth is not configured.");
  }
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "user-agent": USER_AGENT,
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: githubCallbackUrl(request),
    }),
  });
  const body = await readJson<TokenResponse>(response);
  return tokenFromResponse(body);
}

export async function refreshGithubToken(
  refreshToken: string,
): Promise<GithubToken> {
  const clientId = env("GITHUB_CLIENT_ID");
  const clientSecret = env("GITHUB_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    throw new GithubAuthError();
  }
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "user-agent": USER_AGENT,
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  const body = await readJson<TokenResponse>(response);
  return tokenFromResponse(body);
}

function tokenFromResponse(body: TokenResponse): GithubToken {
  if (!body.access_token) {
    throw new GithubAuthError(body.error_description ?? "GitHub token exchange failed.");
  }
  const expiresAt =
    typeof body.expires_in === "number"
      ? new Date(Date.now() + body.expires_in * 1000)
      : null;
  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token ?? null,
    expiresAt,
    scopes: body.scope ?? "",
  };
}

async function githubFetch(url: string, accessToken: string): Promise<Response> {
  const response = await fetch(url, {
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${accessToken}`,
      "user-agent": USER_AGENT,
      "x-github-api-version": "2022-11-28",
    },
  });
  if (response.status === 401) throw new GithubAuthError();
  return response;
}

export async function fetchGithubUser(accessToken: string): Promise<GithubUser> {
  const response = await githubFetch("https://api.github.com/user", accessToken);
  if (!response.ok) {
    throw new Error(`GitHub user lookup failed (${response.status}).`);
  }
  return readJson<GithubUser>(response);
}

export async function listOwnedRepos(accessToken: string): Promise<GithubRepo[]> {
  const repos: GithubRepo[] = [];
  for (let page = 1; page <= 10; page += 1) {
    const url = new URL("https://api.github.com/user/repos");
    url.searchParams.set("affiliation", "owner");
    url.searchParams.set("sort", "pushed");
    url.searchParams.set("direction", "desc");
    url.searchParams.set("per_page", "100");
    url.searchParams.set("page", String(page));
    const response = await githubFetch(url.toString(), accessToken);
    if (!response.ok) {
      throw new Error(`GitHub repo list failed (${response.status}).`);
    }
    const batch = await readJson<GithubRepo[]>(response);
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}
