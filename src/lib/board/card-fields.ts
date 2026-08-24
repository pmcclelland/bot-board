import { MAX_TAG_LENGTH, MAX_TAGS, type Card } from "./types.ts";

export const FALLBACK_PROJECT_ID = "p-inbox";

export function normalizeTag(input: string) {
  return input.trim().replace(/\s+/g, " ").slice(0, MAX_TAG_LENGTH);
}

export function uniqueTags(tags: string[], limit = MAX_TAGS) {
  const seen = new Set<string>();
  const next: string[] = [];
  for (const tag of tags) {
    const value = normalizeTag(tag);
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    next.push(value);
    if (next.length >= limit) break;
  }
  return next;
}

const IPV4 =
  /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;
const DOMAIN =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

function isWebHost(hostname: string) {
  if (!hostname) return false;
  if (hostname === "localhost") return true;
  if (IPV4.test(hostname)) return true;
  return DOMAIN.test(hostname);
}

export function parseUrl(input: string): { ok: true; url: string } | { ok: false } {
  const trimmed = input.trim();
  if (!trimmed) return { ok: true, url: "" };
  if (/\s/.test(trimmed)) return { ok: false };

  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { ok: false };
    }
    if (!isWebHost(url.hostname)) return { ok: false };
    return { ok: true, url: url.toString() };
  } catch {
    return { ok: false };
  }
}

export function linkLabel(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const path = parsed.pathname === "/" ? "" : parsed.pathname;
    return `${host}${path}`;
  } catch {
    return url;
  }
}

export function collectTags(cards: Iterable<Card>) {
  return uniqueTags(Array.from(cards, (card) => card.tags).flat(), Number.POSITIVE_INFINITY);
}

export function cardMatches(
  card: Card,
  query: string,
  selectedTags: string[],
  extraHaystack = "",
) {
  if (selectedTags.length > 0) {
    const have = new Set(card.tags.map((tag) => tag.toLowerCase()));
    const hit = selectedTags.some((tag) => have.has(tag.toLowerCase()));
    if (!hit) return false;
  }

  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  const haystack = [card.title, card.description, card.url, extraHaystack, ...card.tags]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export function normalizeCardFields(
  card: Partial<Card> & Pick<Card, "id" | "title">,
  fallbackProjectId = FALLBACK_PROJECT_ID,
): Card {
  const parsed = parseUrl(typeof card.url === "string" ? card.url : "");
  const projectId =
    typeof card.projectId === "string"
      ? card.projectId.trim()
      : fallbackProjectId;
  return {
    id: card.id,
    title: card.title,
    description: typeof card.description === "string" ? card.description : "",
    url: parsed.ok ? parsed.url : "",
    tags: Array.isArray(card.tags) ? uniqueTags(card.tags) : [],
    projectId,
    createdAt: card.createdAt ?? new Date().toISOString(),
    updatedAt: card.updatedAt ?? card.createdAt ?? new Date().toISOString(),
    createdBy: card.createdBy ?? "",
    creator: card.creator ?? "",
    assigneeId: card.assigneeId ?? "",
    assignee: card.assignee ?? "",
  };
}
