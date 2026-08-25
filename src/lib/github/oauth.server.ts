import { randomBytes } from "node:crypto";
import { getCookie, getRequest, setCookie } from "@tanstack/react-start/server";
import { getSessionUser } from "@/lib/auth/verify.server";
import { requireApprovedHuman } from "@/lib/board/members.server";
import { ServiceError } from "@/lib/board/service";
import {
  exchangeGithubCode,
  fetchGithubUser,
} from "./api";
import { replaceWorkspaceConnection } from "./connection.server";
import {
  GITHUB_OAUTH_SCOPES,
  env,
  githubCallbackUrl,
  githubOAuthConfigured,
  publicOrigin,
} from "./env";
import { syncGithubProjects } from "./sync.server";

const STATE_COOKIE = "bb_github_oauth";
const STATE_MAX_AGE = 600;

function settingsUrl(request: Request, params?: Record<string, string>) {
  const url = new URL("/settings", `${publicOrigin(request)}/`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

function redirect(url: string) {
  return new Response(null, {
    status: 302,
    headers: { location: url },
  });
}

function cookieSecure(request: Request) {
  return publicOrigin(request).startsWith("https://");
}

function writeStateCookie(request: Request, state: string) {
  setCookie(STATE_COOKIE, state, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(request),
    maxAge: STATE_MAX_AGE,
  });
}

function clearStateCookie(request: Request) {
  setCookie(STATE_COOKIE, "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(request),
    maxAge: 0,
  });
}

export function buildGithubAuthorizeUrl(request: Request, state: string) {
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", env("GITHUB_CLIENT_ID") ?? "");
  authorize.searchParams.set("redirect_uri", githubCallbackUrl(request));
  authorize.searchParams.set("scope", GITHUB_OAUTH_SCOPES.join(" "));
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("allow_signup", "false");
  return authorize.toString();
}

export async function startGithubAuthorize(
  request = getRequest(),
): Promise<{ url: string }> {
  if (!request) {
    throw new ServiceError(500, "Missing request", "internal");
  }
  if (!githubOAuthConfigured()) {
    throw new ServiceError(
      422,
      "GitHub is not configured for this board.",
      "not_configured",
    );
  }
  const state = randomBytes(16).toString("base64url");
  writeStateCookie(request, state);
  return { url: buildGithubAuthorizeUrl(request, state) };
}

export async function handleGithubConnect(request: Request): Promise<Response> {
  const origin = publicOrigin(request);
  const session = await getSessionUser();
  if (!session) return redirect(`${origin}/login`);
  try {
    await requireApprovedHuman(session.id);
    const { url } = await startGithubAuthorize(request);
    return redirect(url);
  } catch (error) {
    if (error instanceof ServiceError && error.code === "pending") {
      return redirect(`${origin}/waiting`);
    }
    if (error instanceof ServiceError && error.code === "denied") {
      return redirect(`${origin}/waiting`);
    }
    if (error instanceof ServiceError && error.code === "bots_cannot_connect") {
      return redirect(settingsUrl(request, { github_error: "bots" }));
    }
    if (error instanceof ServiceError && error.code === "not_configured") {
      return redirect(settingsUrl(request, { github_error: "not_configured" }));
    }
    throw error;
  }
}

export async function handleGithubCallback(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code") ?? "";
  const state = url.searchParams.get("state") ?? "";
  const expected = getCookie(STATE_COOKIE) ?? "";
  clearStateCookie(request);

  if (error === "access_denied") {
    return redirect(settingsUrl(request, { github_error: "denied" }));
  }
  if (!expected || !state || expected !== state) {
    return redirect(settingsUrl(request, { github_error: "state" }));
  }
  if (!code) {
    return redirect(settingsUrl(request, { github_error: "exchange" }));
  }

  const session = await getSessionUser();
  if (!session) return redirect(`${publicOrigin(request)}/login`);
  try {
    await requireApprovedHuman(session.id);
    const token = await exchangeGithubCode(request, code);
    const user = await fetchGithubUser(token.accessToken);
    await replaceWorkspaceConnection({
      githubUserId: String(user.id),
      login: user.login,
      avatarUrl: user.avatar_url || null,
      token,
      connectedBy: session.id,
    });
    await syncGithubProjects({ force: true });
    return redirect(settingsUrl(request, { github: "connected" }));
  } catch (caught) {
    if (caught instanceof ServiceError && caught.code === "bots_cannot_connect") {
      return redirect(settingsUrl(request, { github_error: "bots" }));
    }
    console.error("[github-oauth] callback failed");
    return redirect(settingsUrl(request, { github_error: "exchange" }));
  }
}
