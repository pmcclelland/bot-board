import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cardMatches,
  collectTags,
  linkLabel,
  parseUrl,
  uniqueTags,
} from "./card-fields.ts";
import type { Card } from "./types.ts";

function card(partial: Partial<Card> & Pick<Card, "id" | "title">): Card {
  return {
    description: "",
    url: "",
    tags: [],
    projectId: "p-cairn",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

describe("parseUrl", () => {
  it("accepts empty values", () => {
    assert.deepEqual(parseUrl("  "), { ok: true, url: "" });
  });

  it("adds https when the scheme is missing", () => {
    const result = parseUrl("example.com/path");
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.url, "https://example.com/path");
  });

  it("rejects non-http schemes", () => {
    assert.equal(parseUrl("javascript:alert(1)").ok, false);
    assert.equal(parseUrl("data:text/html,hi").ok, false);
  });
});

describe("uniqueTags", () => {
  it("trims, de-dupes, and caps length", () => {
    assert.deepEqual(uniqueTags([" Writing ", "writing", "Launch"]), [
      "Writing",
      "Launch",
    ]);
  });
});

describe("cardMatches", () => {
  const sample = card({
    id: "c1",
    title: "Draft the Friday status note",
    description: "Keep it to one page",
    url: "https://linear.app/cairn",
    tags: ["writing", "weekly"],
  });

  it("filters by selected tags using OR", () => {
    assert.equal(cardMatches(sample, "", ["writing"]), true);
    assert.equal(cardMatches(sample, "", ["design"]), false);
    assert.equal(cardMatches(sample, "", ["design", "weekly"]), true);
  });

  it("searches title, description, url, and tags", () => {
    assert.equal(cardMatches(sample, "friday", []), true);
    assert.equal(cardMatches(sample, "linear", []), true);
    assert.equal(cardMatches(sample, "weekly", []), true);
    assert.equal(cardMatches(sample, "engineering", []), false);
  });
});

describe("collectTags", () => {
  it("returns unique tags across cards", () => {
    const tags = collectTags([
      card({ id: "a", title: "A", tags: ["writing", "Launch"] }),
      card({ id: "b", title: "B", tags: ["launch", "design"] }),
    ]);
    assert.deepEqual(tags, ["writing", "Launch", "design"]);
  });
});

describe("linkLabel", () => {
  it("shows host and path without the scheme", () => {
    assert.equal(linkLabel("https://www.figma.com/file/abc"), "figma.com/file/abc");
  });
});
