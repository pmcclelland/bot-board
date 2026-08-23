import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { FALLBACK_PROJECT_ID, normalizeCardFields, uniqueTags } from "./card-fields";
import { SEED_CARDS, SEED_COLUMNS, SEED_PROJECTS } from "./seed";
import {
  COLUMN_IDS,
  MAX_PROJECT_NAME,
  type Card,
  type CardInput,
  type ColumnId,
  type Columns,
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
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addCard: (input: CardInput) => string;
  updateCard: (id: string, input: CardInput) => void;
  deleteCard: (id: string) => void;
  moveCard: (id: string, columnId: ColumnId) => void;
  moveCardToProject: (id: string, projectId: string) => void;
  relocateCard: (id: string, next: Relocate) => void;
  setColumns: (columns: Columns) => void;
  findColumn: (id: string) => ColumnId | null;
  addProject: (name: string) => string | null;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  resetBoard: () => void;
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

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      cards: SEED_CARDS,
      columns: SEED_COLUMNS,
      projects: SEED_PROJECTS,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      addCard: ({ title, description, url, tags, columnId, projectId }) => {
        const id = newId("c");
        const at = stamp();
        const card: Card = {
          id,
          title: title.trim(),
          description: description.trim(),
          url,
          tags: uniqueTags(tags),
          projectId: projectId.trim(),
          createdAt: at,
          updatedAt: at,
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
      updateCard: (id, { title, description, url, tags, columnId, projectId }) => {
        const state = get();
        const existing = state.cards[id];
        if (!existing) return;
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
      addProject: (name) => {
        const trimmed = name.trim().slice(0, MAX_PROJECT_NAME);
        if (!trimmed) return null;
        const exists = get().projects.some(
          (project) => project.name.toLowerCase() === trimmed.toLowerCase(),
        );
        if (exists) return null;
        const id = newId("p");
        set((state) => ({
          projects: [...state.projects, { id, name: trimmed }],
        }));
        return id;
      },
      renameProject: (id, name) => {
        const trimmed = name.trim().slice(0, MAX_PROJECT_NAME);
        if (!trimmed) return;
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, name: trimmed } : project,
          ),
        }));
      },
      deleteProject: (id) => {
        const state = get();
        if (state.projects.length <= 1) return;
        const fallback = state.projects.find((project) => project.id !== id);
        if (!fallback) return;
        const cards = Object.fromEntries(
          Object.entries(state.cards).map(([cardId, card]) => [
            cardId,
            card.projectId === id ? { ...card, projectId: fallback.id } : card,
          ]),
        );
        set({
          projects: state.projects.filter((project) => project.id !== id),
          cards,
        });
      },
      resetBoard: () =>
        set({
          cards: structuredClone(SEED_CARDS),
          columns: structuredClone(SEED_COLUMNS),
          projects: structuredClone(SEED_PROJECTS),
        }),
    }),
    {
      name: "cairn-board-v1",
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cards: state.cards,
        columns: state.columns,
        projects: state.projects,
      }),
      migrate: (persisted) => {
        const state = persisted as {
          cards?: Record<string, Card>;
          columns?: Columns;
          projects?: Project[];
        };
        const projects =
          state.projects && state.projects.length > 0
            ? state.projects.map((project) => ({
                id: project.id,
                name: String(project.name ?? "Project").slice(0, MAX_PROJECT_NAME),
              }))
            : [{ id: FALLBACK_PROJECT_ID, name: "Inbox" }];
        const known = new Set(projects.map((project) => project.id));
        const fallback = projects[0]?.id ?? FALLBACK_PROJECT_ID;
        const cards = Object.fromEntries(
          Object.entries(state.cards ?? {}).map(([id, card]) => {
            const next = normalizeCardFields(card, fallback);
            if (next.projectId && !known.has(next.projectId)) {
              next.projectId = fallback;
            }
            return [id, next];
          }),
        );
        return { ...state, cards, projects };
      },
      skipHydration: true,
      onRehydrateStorage: () => () => {
        useBoardStore.setState({ hasHydrated: true });
      },
    },
  ),
);
