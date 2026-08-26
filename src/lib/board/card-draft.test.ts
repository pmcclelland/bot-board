import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cardEditorChrome,
  draftFromCard,
  emptyCardDraft,
} from "./card-draft.ts";
import type { Card } from "./types.ts";

const card: Card = {
  id: "c1",
  title: "Draft the note",
  description: "Keep it to one page.",
  url: "https://example.com",
  tags: ["writing"],
  projectId: "p-launch",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
  createdBy: "u1",
  creator: "Ada",
  assigneeId: "u2",
  assignee: "Bess",
  assigneeImage: null,
};

describe("cardEditorChrome", () => {
  it("keeps create in the centered modal", () => {
    assert.equal(cardEditorChrome("create"), "modal");
  });

  it("opens edit in the side sheet", () => {
    assert.equal(cardEditorChrome("edit"), "sheet");
  });
});

describe("emptyCardDraft", () => {
  it("starts a blank create draft in the chosen lane", () => {
    assert.deepEqual(emptyCardDraft("doing", "p-launch"), {
      title: "",
      description: "",
      url: "",
      tags: [],
      columnId: "doing",
      projectId: "p-launch",
      assigneeId: "",
    });
  });
});

describe("draftFromCard", () => {
  it("copies the full task into the edit draft", () => {
    assert.deepEqual(draftFromCard(card, "todo"), {
      title: "Draft the note",
      description: "Keep it to one page.",
      url: "https://example.com",
      tags: ["writing"],
      columnId: "todo",
      projectId: "p-launch",
      assigneeId: "u2",
      creator: "Ada",
    });
  });
});
