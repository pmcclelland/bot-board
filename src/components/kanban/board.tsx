import {
  closestCorners,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  createTaskFn,
  deleteTaskFn,
  loadBoardFn,
  moveTaskFn,
  updateTaskFn,
} from "@/lib/board/server-fns";
import { snapshotToState } from "@/lib/board/snapshot";
import { useBoardStore } from "@/lib/board/store";
import { cardMatches, collectTags } from "@/lib/board/card-fields";
import {
  COLUMN_IDS,
  COLUMN_META,
  columnFromDroppable,
  type ColumnId,
  type Columns,
} from "@/lib/board/types";
import { BoardHeading } from "./board-heading";
import { CardDialog, type CardDraft } from "./card-dialog";
import { BoardFilters } from "./filters";
import { BoardHeader } from "./header";
import { KanbanCardView } from "./kanban-card";
import { KanbanColumn } from "./column";
import { LaneDock } from "./lane-dock";
import { LaneSwitcher } from "./lane-switcher";

const dropAnimation = {
  duration: 220,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0" } },
  }),
};

const collisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  const cardHit = pointerHits.find((hit) => !columnFromDroppable(String(hit.id)));
  if (cardHit) return [cardHit];
  if (pointerHits.length > 0) return pointerHits;
  const rectHits = rectIntersection(args);
  const rectCard = rectHits.find((hit) => !columnFromDroppable(String(hit.id)));
  if (rectCard) return [rectCard];
  if (rectHits.length > 0) return rectHits;
  return closestCorners(args);
};

function listsEqual(a: string[], b: string[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every((id, index) => id === b[index]);
}

export function KanbanBoard() {
  const { user, isPending } = useCurrentUserState();
  const queryClient = useQueryClient();
  const cards = useBoardStore((s) => s.cards);
  const columns = useBoardStore((s) => s.columns);
  const projects = useBoardStore((s) => s.projects);
  const hasHydrated = useBoardStore((s) => s.hasHydrated);
  const setColumns = useBoardStore((s) => s.setColumns);
  const findColumn = useBoardStore((s) => s.findColumn);
  const addProject = useBoardStore((s) => s.addProject);
  const hydrate = useBoardStore((s) => s.hydrate);

  const boardQuery = useQuery({
    queryKey: ["board"],
    queryFn: () => loadBoardFn(),
    enabled: Boolean(user),
  });

  useEffect(() => {
    if (!boardQuery.data) return;
    hydrate(snapshotToState(boardQuery.data));
  }, [boardQuery.data, hydrate]);

  function refreshBoard() {
    void queryClient.invalidateQueries({ queryKey: ["board"] });
  }

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [dialog, setDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    cardId?: string;
    draft: CardDraft;
  }>({
    open: false,
    mode: "create",
    draft: {
      title: "",
      description: "",
      url: "",
      tags: [],
      columnId: "todo",
      projectId: "",
    },
  });
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [activeLane, setActiveLane] = useState<ColumnId>("todo");
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const lists = useMemo(() => {
    const next: Record<ColumnId, (typeof cards)[string][]> = {
      todo: [],
      doing: [],
      done: [],
    };
    for (const id of COLUMN_IDS) {
      next[id] = columns[id].map((cardId) => cards[cardId]).filter(Boolean);
    }
    return next;
  }, [cards, columns]);

  const filtering =
    query.trim().length > 0 ||
    selectedTags.length > 0 ||
    Boolean(selectedProjectId);

  const visibleLists = useMemo(() => {
    const match = (card: (typeof cards)[string]) => {
      if (selectedProjectId && card.projectId !== selectedProjectId) return false;
      const projectName =
        projects.find((project) => project.id === card.projectId)?.name ?? "";
      return cardMatches(card, query, selectedTags, projectName);
    };
    if (!filtering) return lists;
    return {
      todo: lists.todo.filter(match),
      doing: lists.doing.filter(match),
      done: lists.done.filter(match),
    };
  }, [filtering, lists, query, selectedTags, selectedProjectId, projects]);

  const allTags = useMemo(() => collectTags(Object.values(cards)), [cards]);
  const total = Object.keys(cards).length;
  const visibleTotal =
    visibleLists.todo.length + visibleLists.doing.length + visibleLists.done.length;
  const activeCard = activeId ? cards[String(activeId)] : undefined;
  const pendingCard = pendingDelete ? cards[pendingDelete] : undefined;
  const selectedProjectName = selectedProjectId
    ? projects.find((project) => project.id === selectedProjectId)?.name ?? null
    : null;
  const searchFiltering = query.trim().length > 0 || selectedTags.length > 0;

  const openCreate = useCallback(
    (columnId: ColumnId = activeLane) => {
      setDialog({
        open: true,
        mode: "create",
        draft: {
          title: "",
          description: "",
          url: "",
          tags: [],
          columnId,
          projectId: selectedProjectId ?? "",
        },
      });
    },
    [activeLane, selectedProjectId],
  );

  const openEdit = useCallback((id: string) => {
    const card = useBoardStore.getState().cards[id];
    const columnId = useBoardStore.getState().findColumn(id) ?? "todo";
    if (!card) return;
    setDialog({
      open: true,
      mode: "edit",
      cardId: id,
      draft: {
        title: card.title,
        description: card.description,
        url: card.url ?? "",
        tags: card.tags ?? [],
        columnId,
        projectId: card.projectId ?? "",
      },
    });
  }, []);

  async function handleDialogSubmit(draft: CardDraft) {
    try {
      if (dialog.mode === "create") {
        await createTaskFn({ data: draft });
        toast("Task added", {
          description: `Placed in ${COLUMN_META[draft.columnId].label}.`,
        });
      } else if (dialog.cardId) {
        await updateTaskFn({ data: { id: dialog.cardId, ...draft } });
        toast("Task updated");
      }
      refreshBoard();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save task");
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteTaskFn({ data: { id: pendingDelete } });
      toast("Task deleted");
      setPendingDelete(null);
      refreshBoard();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete task");
    }
  }

  async function handleMove(id: string, columnId: ColumnId) {
    try {
      await moveTaskFn({ data: { id, columnId } });
      toast("Task moved", {
        description: `Now in ${COLUMN_META[columnId].label}.`,
      });
      refreshBoard();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not move task");
    }
  }

  function toggleTag(tag: string) {
    setSelectedTags((current) => {
      const exists = current.some((item) => item.toLowerCase() === tag.toLowerCase());
      if (exists) {
        return current.filter((item) => item.toLowerCase() !== tag.toLowerCase());
      }
      return [...current, tag];
    });
  }

  function clearFilters() {
    setQuery("");
    setSelectedTags([]);
    setSelectedProjectId(null);
  }

  function scrollToLane(id: ColumnId) {
    const scroller = scrollerRef.current;
    if (!scroller) {
      setActiveLane(id);
      return;
    }
    const index = COLUMN_IDS.indexOf(id);
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    scroller.scrollTo({
      left: index * scroller.clientWidth,
      behavior: reduceMotion ? "auto" : "smooth",
    });
    setActiveLane(id);
  }

  function handleScrollerScroll() {
    const scroller = scrollerRef.current;
    if (!scroller || scroller.clientWidth === 0) return;
    const index = Math.round(scroller.scrollLeft / scroller.clientWidth);
    const id = COLUMN_IDS[Math.max(0, Math.min(index, COLUMN_IDS.length - 1))];
    if (id && id !== activeLane) setActiveLane(id);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const overId = String(over.id);
    const activeIdStr = String(active.id);
    if (activeIdStr === overId) return;

    const from = findColumn(activeIdStr);
    const to = columnFromDroppable(overId) ?? findColumn(overId);
    if (!from || !to || from === to) return;

    const current = useBoardStore.getState().columns;
    const fromItems = current[from].filter((id) => id !== activeIdStr);
    const toItems = current[to].filter((id) => id !== activeIdStr);
    const overIndex = toItems.indexOf(overId);
    const insertAt = overIndex === -1 ? toItems.length : overIndex;

    const next: Columns = {
      ...current,
      [from]: fromItems,
      [to]: [
        ...toItems.slice(0, insertAt),
        activeIdStr,
        ...toItems.slice(insertAt),
      ],
    };

    if (listsEqual(current[from], next[from]) && listsEqual(current[to], next[to])) {
      return;
    }
    setColumns(next);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) {
      refreshBoard();
      return;
    }

    const activeIdStr = String(active.id);
    const overId = String(over.id);
    const from = findColumn(activeIdStr);
    const to = columnFromDroppable(overId) ?? findColumn(overId);
    if (!from || !to) return;

    const current = useBoardStore.getState().columns;

    if (from === to) {
      const items = current[from];
      const oldIndex = items.indexOf(activeIdStr);
      const newIndex = columnFromDroppable(overId)
        ? items.length - 1
        : items.indexOf(overId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        void persistDrag(activeIdStr);
        return;
      }
      setColumns({
        ...current,
        [from]: arrayMove(items, oldIndex, newIndex),
      });
    }
    void persistDrag(activeIdStr);
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  async function persistDrag(id: string) {
    const columnId = findColumn(id);
    if (!columnId) return;
    const lane = useBoardStore.getState().columns[columnId];
    const index = lane.indexOf(id);
    const beforeId = index >= 0 && index < lane.length - 1 ? lane[index + 1] : null;
    try {
      await moveTaskFn({ data: { id, columnId, beforeId } });
      refreshBoard();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not move task");
      refreshBoard();
    }
  }

  if (isPending) {
    return (
      <div className="board-shell flex h-dvh items-center justify-center bg-background text-muted">
        Loading…
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (boardQuery.isPending && !hasHydrated) {
    return (
      <div className="board-shell flex h-dvh items-center justify-center bg-background text-muted">
        Loading board…
      </div>
    );
  }
  if (boardQuery.isError && !hasHydrated) {
    return (
      <div className="board-shell grid h-dvh place-items-center bg-background px-4 text-fg">
        <div className="max-w-sm space-y-3 text-center">
          <p className="text-sm text-muted">Could not load the board.</p>
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={() => refreshBoard()}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="board-shell flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-3 px-3 py-3 md:gap-6 md:px-8 md:py-8">
        <BoardHeader onAdd={() => openCreate(activeLane)} />

        <BoardFilters
          query={query}
          tags={allTags}
          selectedTags={selectedTags}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onQueryChange={setQuery}
          onToggleTag={toggleTag}
          onSelectProject={setSelectedProjectId}
          onClearTags={() => setSelectedTags([])}
        />

        <div className="flex min-h-0 flex-1 flex-col gap-2 md:gap-3">
          <BoardHeading
            projectName={selectedProjectName}
            visible={visibleTotal}
            total={total}
            filtering={filtering}
          />

          <LaneSwitcher
            active={activeLane}
            counts={{
              todo: visibleLists.todo.length,
              doing: visibleLists.doing.length,
              done: visibleLists.done.length,
            }}
            onSelect={scrollToLane}
          />

        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div
            ref={scrollerRef}
            onScroll={handleScrollerScroll}
            className="lane-scroller flex min-h-0 flex-1 items-stretch overflow-x-auto overflow-y-hidden snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-3 md:overflow-visible md:snap-none"
          >
            {COLUMN_IDS.map((columnId) => (
              <KanbanColumn
                key={columnId}
                columnId={columnId}
                cards={visibleLists[columnId]}
                empty={lists[columnId].length === 0}
                filtering={filtering}
                selectedTags={selectedTags}
                projectName={selectedProjectName}
                dragDisabled={searchFiltering}
                onAdd={openCreate}
                onEdit={openEdit}
                onDelete={setPendingDelete}
                onMove={handleMove}
                onToggleTag={toggleTag}
              />
            ))}
          </div>

          <LaneDock active={Boolean(activeId)} />

          <DragOverlay dropAnimation={dropAnimation}>
            {activeCard ? (
              <KanbanCardView
                card={activeCard}
                isOverlay
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
        </div>
      </div>

      <CardDialog
        open={dialog.open}
        mode={dialog.mode}
        initial={dialog.draft}
        suggestions={allTags}
        projects={projects}
        onCreateProject={addProject}
        onOpenChange={(open) => setDialog((current) => ({ ...current, open }))}
        onSubmit={handleDialogSubmit}
      />

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this card?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingCard
                ? `“${pendingCard.title}” will be removed from the board. This cannot be undone.`
                : "This card will be removed from the board."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-danger text-danger-fg hover:bg-danger/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
