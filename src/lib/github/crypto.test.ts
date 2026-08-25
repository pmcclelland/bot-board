import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decryptSecret, encryptSecret } from "./crypto.ts";

describe("github token crypto", () => {
  it("round-trips a token", () => {
    const token = "gho_test-token-value";
    const encrypted = encryptSecret(token);
    assert.notEqual(encrypted, token);
    assert.match(encrypted, /^v1\./);
    assert.equal(decryptSecret(encrypted), token);
  });

  it("uses a unique payload each time", () => {
    const token = "gho_same";
    assert.notEqual(encryptSecret(token), encryptSecret(token));
  });
});
