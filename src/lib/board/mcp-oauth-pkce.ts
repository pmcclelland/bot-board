import { createHash, timingSafeEqual } from "node:crypto";

export function pkceS256Challenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function verifyPkceS256(verifier: string, challenge: string) {
  if (!verifier || !challenge) return false;
  const computed = Buffer.from(pkceS256Challenge(verifier));
  const expected = Buffer.from(challenge);
  if (computed.length !== expected.length) return false;
  return timingSafeEqual(computed, expected);
}
