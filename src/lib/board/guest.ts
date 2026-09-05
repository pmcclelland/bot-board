import { demoBoardState } from "./seed.ts";
import { useBoardStore } from "./store.ts";
import type { CardInput, ColumnId } from "./types.ts";

export function hydrateGuestBoard() {
  useBoardStore.getState().hydrate(demoBoardState());
}

export function guestCreateTask(input: CardInput) {
  return useBoardStore.getState().addCard(input);
}

export function guestUpdateTask(id: string, input: CardInput) {
  useBoardStore.getState().updateCard(id, input);
}

export function guestDeleteTask(id: string) {
  useBoardStore.getState().deleteCard(id);
}

export function guestMoveTask(
  id: string,
  columnId: ColumnId,
  beforeId: string | null = null,
) {
  const state = useBoardStore.getState();
  const card = state.cards[id];
  if (!card) return;
  state.relocateCard(id, {
    columnId,
    projectId: card.projectId,
    beforeId,
  });
}
