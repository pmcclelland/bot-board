import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { githubCallbackUrl, publicOrigin } from "./env.ts";

const original = {
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  VERCEL_URL: process.env.VERCEL_URL,
};

afterEach(() => {
  if (original.BETTER_AUTH_URL === undefined) delete process.env.BETTER_AUTH_URL;
  else process.env.BETTER_AUTH_URL = original.BETTER_AUTH_URL;
  if (original.VERCEL_URL === undefined) delete process.env.VERCEL_URL;
  else process.env.VERCEL_URL = original.VERCEL_URL;
});

function request(url: string, headers?: Record<string, string>) {
  return new Request(url, { headers });
}

describe("publicOrigin", () => {
  it("uses x-forwarded-host even when BETTER_AUTH_URL is production", () => {
    process.env.BETTER_AUTH_URL = "https://botboard.pmcclel.land";
    const origin = publicOrigin(
      request("http://127.0.0.1:8080/api/github/connect", {
        "x-forwarded-host":
          "bot-board-git-cursor-github-projects-e085-pmcclellands-projects.vercel.app",
        "x-forwarded-proto": "https",
      }),
    );
    assert.equal(
      origin,
      "https://bot-board-git-cursor-github-projects-e085-pmcclellands-projects.vercel.app",
    );
    assert.equal(
      githubCallbackUrl(
        request("http://127.0.0.1:8080/api/github/connect", {
          "x-forwarded-host":
            "bot-board-git-cursor-github-projects-e085-pmcclellands-projects.vercel.app",
          "x-forwarded-proto": "https",
        }),
      ),
      "https://bot-board-git-cursor-github-projects-e085-pmcclellands-projects.vercel.app/api/github/callback",
    );
  });

  it("keeps production on the request host, not a leftover preview URL", () => {
    process.env.BETTER_AUTH_URL = "https://some-other.example";
    const origin = publicOrigin(
      request("https://botboard.pmcclel.land/settings", {
        "x-forwarded-host": "botboard.pmcclel.land",
        "x-forwarded-proto": "https",
      }),
    );
    assert.equal(origin, "https://botboard.pmcclel.land");
  });

  it("falls back to VERCEL_URL when the request host is loopback", () => {
    delete process.env.BETTER_AUTH_URL;
    process.env.VERCEL_URL =
      "bot-board-git-cursor-github-projects-e085-pmcclellands-projects.vercel.app";
    const origin = publicOrigin(request("http://127.0.0.1:8080/api/github/connect"));
    assert.equal(
      origin,
      "https://bot-board-git-cursor-github-projects-e085-pmcclellands-projects.vercel.app",
    );
  });

  it("uses the local request origin in development", () => {
    delete process.env.BETTER_AUTH_URL;
    delete process.env.VERCEL_URL;
    assert.equal(
      publicOrigin(request("http://127.0.0.1:8080/settings")),
      "http://127.0.0.1:8080",
    );
  });
});
