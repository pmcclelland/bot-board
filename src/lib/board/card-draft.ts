import type { Card, ColumnId } from "./types.ts";

export type CardDraft = {
  title: string;
  description: string;
  url: string;
  tags: string[];
  columnId: ColumnId;
  projectId: string;
  assigneeId: string;
  creator?: string;
};

export type CardEditorChrome = "modal" | "sheet";

export function cardEditorChrome(mode: "create" | "edit"): CardEditorChrome {
  return mode === "edit" ? "sheet" : "modal";
}

export function emptyCardDraft(
  columnId: ColumnId,
  projectId = "",
): CardDraft {
  return {
    title: "",
    description: "",
    url: "",
    tags: [],
    columnId,
    projectId,
    assigneeId: "",
  };
}

export function draftFromCard(card: Card, columnId: ColumnId): CardDraft {
  return {
    title: card.title,
    description: card.description,
    url: card.url ?? "",
    tags: card.tags ?? [],
    columnId,
    projectId: card.projectId ?? "",
    assigneeId: card.assigneeId ?? "",
    creator: card.creator,
  };
}
