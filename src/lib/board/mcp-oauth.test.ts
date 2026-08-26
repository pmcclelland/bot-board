import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  authorizationServerMetadata,
  handleWellKnown,
  isAllowedRedirectUri,
  parseAuthorizeParams,
  protectedResourceMetadata,
  wellKnownKind,
  wwwAuthenticate,
} from "./mcp-oauth.ts";
import { pkceS256Challenge, verifyPkceS256 } from "./mcp-oauth-pkce.ts";
import { safeInternalPath } from "./safe-path.ts";

describe("wellKnownKind", () => {
  it("serves authorization-server metadata at the origin root Cursor probes", () => {
    assert.equal(
      wellKnownKind("/.well-known/oauth-authorization-server"),
      "authorization-server",
    );
    assert.equal(
      wellKnownKind("/.well-known/openid-configuration"),
      "authorization-server",
    );
  });

  it("serves protected-resource metadata at root and /api/mcp insertion", () => {
    assert.equal(
      wellKnownKind("/.well-known/oauth-protected-resource"),
      "protected-resource",
    );
    assert.equal(
      wellKnownKind("/.well-known/oauth-protected-resource/api/mcp"),
      "protected-resource",
    );
  });

  it("does not invent other well-known documents", () => {
    assert.equal(wellKnownKind("/.well-known/unknown"), "not-found");
  });
});

describe("authorizationServerMetadata", () => {
  it("uses the request origin as issuer with DCR and PKCE S256", () => {
    const meta = authorizationServerMetadata("https://botboard.pmcclel.land");
    assert.equal(meta.issuer, "https://botboard.pmcclel.land");
    assert.equal(
      meta.authorization_endpoint,
      "https://botboard.pmcclel.land/oauth/authorize",
    );
    assert.equal(meta.token_endpoint, "https://botboard.pmcclel.land/oauth/token");
    assert.equal(
      meta.registration_endpoint,
      "https://botboard.pmcclel.land/oauth/register",
    );
    assert.deepEqual(meta.code_challenge_methods_supported, ["S256"]);
    assert.ok(meta.grant_types_supported.includes("authorization_code"));
  });
});

describe("protectedResourceMetadata", () => {
  it("points Cursor at the origin issuer and the single /api/mcp resource", () => {
    const meta = protectedResourceMetadata("https://preview.vercel.app");
    assert.equal(meta.resource, "https://preview.vercel.app/api/mcp");
    assert.deepEqual(meta.authorization_servers, ["https://preview.vercel.app"]);
  });
});

describe("wwwAuthenticate", () => {
  it("advertises protected-resource metadata for the MCP path", () => {
    assert.equal(
      wwwAuthenticate("https://botboard.pmcclel.land"),
      'Bearer realm="Bot Board", resource_metadata="https://botboard.pmcclel.land/.well-known/oauth-protected-resource/api/mcp", scope="board"',
    );
  });
});

describe("isAllowedRedirectUri", () => {
  it("allows https, loopback http, and native Cursor schemes", () => {
    assert.equal(isAllowedRedirectUri("https://cursor.com/oauth/callback"), true);
    assert.equal(isAllowedRedirectUri("http://127.0.0.1:8734/callback"), true);
    assert.equal(isAllowedRedirectUri("http://localhost:8734/callback"), true);
    assert.equal(
      isAllowedRedirectUri("cursor://anysphere.cursor-mcp/oauth/callback"),
      true,
    );
  });

  it("rejects javascript and public http", () => {
    assert.equal(isAllowedRedirectUri("javascript:alert(1)"), false);
    assert.equal(isAllowedRedirectUri("http://evil.example/callback"), false);
  });
});

describe("verifyPkceS256", () => {
  it("accepts the matching verifier and rejects a wrong one", () => {
    const verifier = "a".repeat(43);
    const challenge = pkceS256Challenge(verifier);
    assert.equal(verifyPkceS256(verifier, challenge), true);
    assert.equal(verifyPkceS256("b".repeat(43), challenge), false);
  });
});

describe("safeInternalPath", () => {
  it("keeps OAuth return paths and drops open redirects", () => {
    assert.equal(
      safeInternalPath("/oauth/authorize?client_id=1"),
      "/oauth/authorize?client_id=1",
    );
    assert.equal(safeInternalPath("https://evil.example"), "/");
    assert.equal(safeInternalPath("//evil.example"), "/");
  });
});

describe("handleWellKnown", () => {
  it("returns RFC 8414 JSON at the origin root Cursor probes", async () => {
    const response = handleWellKnown(
      new Request("https://botboard.pmcclel.land/.well-known/oauth-authorization-server", {
        headers: {
          "x-forwarded-host": "botboard.pmcclel.land",
          "x-forwarded-proto": "https",
        },
      }),
    );
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "application/json");
    const body = (await response.json()) as { issuer: string; registration_endpoint: string };
    assert.equal(body.issuer, "https://botboard.pmcclel.land");
    assert.equal(body.registration_endpoint, "https://botboard.pmcclel.land/oauth/register");
  });
});

describe("parseAuthorizeParams", () => {
  it("defaults response type, PKCE method, and board scope", () => {
    const params = parseAuthorizeParams(
      new URLSearchParams("client_id=abc&redirect_uri=cursor://x&code_challenge=yz"),
    );
    assert.equal(params.response_type, "code");
    assert.equal(params.code_challenge_method, "S256");
    assert.equal(params.scope, "board");
  });
});
