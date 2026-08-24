import { create } from "zustand";
import { uniqueTags } from "./card-fields";
import {
  COLUMN_IDS,
  type Card,
  type CardInput,
  type ColumnId,
  type Columns,
  type Person,
  type Project,
} from "./types";

type Relocate = {
  columnId: ColumnId;
  projectId: string;
  beforeId: string | null;
};

type BoardState = {
  cards: Record<string, Card>;
  columns: Columns;
  projects: Project[];
  people: Person[];
  hasHydrated: boolean;
  hydrate: (next: {
    cards: Record<string, Card>;
    columns: Columns;
    projects: Project[];
    people: Person[];
  }) => void;
  addCard: (input: CardInput) => string;
  updateCard: (id: string, input: CardInput) => void;
  deleteCard: (id: string) => void;
  moveCard: (id: string, columnId: ColumnId) => void;
  moveCardToProject: (id: string, projectId: string) => void;
  relocateCard: (id: string, next: Relocate) => void;
  setColumns: (columns: Columns) => void;
  findColumn: (id: string) => ColumnId | null;
  addProject: (name: string) => Promise<string | null>;
};

function stamp() {
  return new Date().toISOString();
}

function newId(prefix: string) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function columnOf(columns: Columns, id: string): ColumnId | null {
  for (const columnId of COLUMN_IDS) {
    if (columns[columnId].includes(id)) return columnId;
  }
  return null;
}

function findLastIndex(ids: string[], match: (id: string) => boolean) {
  for (let index = ids.length - 1; index >= 0; index -= 1) {
    if (match(ids[index])) return index;
  }
  return -1;
}

function listsEqual(a: string[], b: string[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every((id, index) => id === b[index]);
}

function insertCard(
  column: string[],
  cardId: string,
  projectId: string,
  beforeId: string | null,
  cards: Record<string, Card>,
) {
  const target = column.filter((id) => id !== cardId);
  let insertAt = target.length;
  if (beforeId && target.includes(beforeId)) {
    insertAt = target.indexOf(beforeId);
  } else {
    const last = findLastIndex(
      target,
      (id) => cards[id]?.projectId === projectId,
    );
    insertAt = last === -1 ? target.length : last + 1;
  }
  return [...target.slice(0, insertAt), cardId, ...target.slice(insertAt)];
}

export const useBoardStore = create<BoardState>()((set, get) => ({
      cards: {},
      columns: { todo: [], doing: [], done: [] },
      projects: [],
      people: [],
      hasHydrated: false,
      hydrate: (next) => set({ ...next, hasHydrated: true }),
      addCard: ({ title, description, url, tags, columnId, projectId, assigneeId }) => {
        const id = newId("c");
        const at = stamp();
        const person = get().people.find((item) => item.userId === assigneeId);
        const card: Card = {
          id,
          title: title.trim(),
          description: description.trim(),
          url,
          tags: uniqueTags(tags),
          projectId: projectId.trim(),
          createdAt: at,
          updatedAt: at,
          createdBy: "",
          creator: "",
          assigneeId: assigneeId.trim(),
          assignee: person?.name ?? "",
          assigneeImage: person?.image ?? null,
        };
        set((state) => ({
          cards: { ...state.cards, [id]: card },
          columns: {
            ...state.columns,
            [columnId]: insertCard(
              state.columns[columnId],
              id,
              card.projectId,
              null,
              { ...state.cards, [id]: card },
            ),
          },
        }));
        return id;
      },
      updateCard: (id, { title, description, url, tags, columnId, projectId, assigneeId }) => {
        const state = get();
        const existing = state.cards[id];
        if (!existing) return;
        const person = get().people.find((item) => item.userId === assigneeId.trim());
        const from = columnOf(state.columns, id);
        const nextProject = projectId.trim();
        let columns = state.columns;
        if (from && (from !== columnId || existing.projectId !== nextProject)) {
          const without = {
            ...state.columns,
            [from]: state.columns[from].filter((item) => item !== id),
          };
          columns = {
            ...without,
            [columnId]: insertCard(
              without[columnId],
              id,
              nextProject,
              null,
              { ...state.cards, [id]: { ...existing, projectId: nextProject } },
            ),
          };
        }
        set({
          columns,
          cards: {
            ...state.cards,
            [id]: {
              ...existing,
              title: title.trim(),
              description: description.trim(),
              url,
              tags: uniqueTags(tags),
              projectId: nextProject,
              assigneeId: assigneeId.trim(),
              assignee: person?.name ?? "",
              assigneeImage: person?.image ?? null,
              updatedAt: stamp(),
            },
          },
        });
      },
      deleteCard: (id) => {
        const state = get();
        const from = columnOf(state.columns, id);
        if (!from) return;
        const { [id]: _removed, ...rest } = state.cards;
        set({
          cards: rest,
          columns: {
            ...state.columns,
            [from]: state.columns[from].filter((item) => item !== id),
          },
        });
      },
      moveCard: (id, columnId) => {
        const card = get().cards[id];
        if (!card) return;
        get().relocateCard(id, {
          columnId,
          projectId: card.projectId,
          beforeId: null,
        });
      },
      moveCardToProject: (id, projectId) => {
        const from = columnOf(get().columns, id);
        if (!from) return;
        get().relocateCard(id, { columnId: from, projectId, beforeId: null });
      },
      relocateCard: (id, { columnId, projectId, beforeId }) => {
        const state = get();
        const existing = state.cards[id];
        const from = columnOf(state.columns, id);
        if (!existing || !from) return;
        if (
          projectId &&
          !state.projects.some((project) => project.id === projectId)
        ) {
          return;
        }

        const nextColumns: Columns = { ...state.columns };
        if (from !== columnId) {
          nextColumns[from] = state.columns[from].filter((item) => item !== id);
        }
        nextColumns[columnId] = insertCard(
          nextColumns[columnId],
          id,
          projectId,
          beforeId,
          { ...state.cards, [id]: { ...existing, projectId } },
        );

        const samePlace =
          existing.projectId === projectId &&
          from === columnId &&
          listsEqual(state.columns[columnId], nextColumns[columnId]);
        if (samePlace) return;

        set({
          columns: nextColumns,
          cards: {
            ...state.cards,
            [id]: {
              ...existing,
              projectId,
              updatedAt:
                existing.projectId === projectId && from === columnId
                  ? existing.updatedAt
                  : stamp(),
            },
          },
        });
      },
      setColumns: (columns) => set({ columns }),
      findColumn: (id) => {
        if ((COLUMN_IDS as readonly string[]).includes(id)) {
          return id as ColumnId;
        }
        return columnOf(get().columns, id);
      },
      addProject: async (name) => {
        const { createProjectFn } = await import("./server-fns");
        const project = await createProjectFn({ data: { name } });
        set((state) => ({
          projects: state.projects.some((item) => item.id === project.id)
            ? state.projects
            : [...state.projects, project],
        }));
        return project.id;
      },
}));
