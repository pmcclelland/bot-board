/** Better Auth still requires an email column. Usernames map to this host. */
export const BOT_EMAIL_HOST = "botboard.internal";

const USERNAME = /^[a-z0-9](?:[a-z0-9._-]{0,30}[a-z0-9])?$/i;
const PROFILE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type BotLogin =
  | { ok: true; email: string; username: string }
  | { ok: false; error: string };

export function parseBotLogin(value: string): BotLogin {
  const trimmed = value.trim();
  if (!trimmed) return { ok: false, error: "Enter a username." };

  if (trimmed.includes("@")) {
    return {
      ok: false,
      error: "Enter a username, like leo.pm — no email needed.",
    };
  }

  if (!USERNAME.test(trimmed) || trimmed.length < 2) {
    return {
      ok: false,
      error: "Usernames use letters, numbers, dots, hyphens, or underscores.",
    };
  }

  const username = trimmed.toLowerCase();
  return { ok: true, email: `${username}@${BOT_EMAIL_HOST}`, username };
}

export function isInternalEmail(email: string) {
  return email.trim().toLowerCase().endsWith(`@${BOT_EMAIL_HOST}`);
}

/** Profile email shown or stored on a member — never the synthetic auth address. */
export function publicProfileEmail(email: string) {
  const trimmed = email.trim();
  if (!trimmed || isInternalEmail(trimmed)) return "";
  return trimmed;
}

export function isProfileEmail(value: string) {
  return PROFILE_EMAIL.test(value.trim());
}

export function displayHandle(email: string) {
  const trimmed = email.trim();
  if (isInternalEmail(trimmed)) {
    return trimmed.slice(0, -(BOT_EMAIL_HOST.length + 1));
  }
  return trimmed;
}
