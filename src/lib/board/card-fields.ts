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

export function parseUrl(input: string): { ok: true; url: string } | { ok: false } {
  const trimmed = input.trim();
  if (!trimmed) return { ok: true, url: "" };

  let candidate = trimmed;
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { ok: false };
    }
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
    typeof card.projectId === "string" && card.projectId.trim()
      ? card.projectId
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
  };
}
