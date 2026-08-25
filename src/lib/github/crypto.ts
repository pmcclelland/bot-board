import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const PREFIX = "v1.";

const globalRef = globalThis as typeof globalThis & {
  __bbGithubCryptoSecret__?: string;
};

function secretSource() {
  const configured = process.env.BETTER_AUTH_SECRET?.trim();
  if (configured) return configured;
  globalRef.__bbGithubCryptoSecret__ ??= randomBytes(32).toString("hex");
  return globalRef.__bbGithubCryptoSecret__;
}

function keyBytes() {
  return createHash("sha256").update(secretSource()).digest();
}

/** Encrypt a GitHub token for storage. Never log the return value. */
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, keyBytes(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function decryptSecret(payload: string): string {
  if (!payload.startsWith(PREFIX)) {
    throw new Error("Unsupported secret encoding");
  }
  const raw = Buffer.from(payload.slice(PREFIX.length), "base64url");
  if (raw.length < IV_LENGTH + TAG_LENGTH + 1) {
    throw new Error("Invalid secret payload");
  }
  const iv = raw.subarray(0, IV_LENGTH);
  const tag = raw.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = raw.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = createDecipheriv(ALGO, keyBytes(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8",
  );
}
