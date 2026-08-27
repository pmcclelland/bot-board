import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLUMN_META, type Card, type ColumnId } from "@/lib/board/types";
import { cn } from "@/lib/utils";
import { SortableKanbanCard } from "./kanban-card";

type KanbanColumnProps = {
  columnId: ColumnId;
  cards: Card[];
  empty: boolean;
  filtering: boolean;
  selectedTags: string[];
  projectName: string | null;
  dragDisabled: boolean;
  onAdd: (columnId: ColumnId) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, columnId: ColumnId) => void;
  onToggleTag: (tag: string) => void;
};

export function KanbanColumn({
  columnId,
  cards,
  empty,
  filtering,
  selectedTags,
  projectName,
  dragDisabled,
  onAdd,
  onEdit,
  onDelete,
  onMove,
  onToggleTag,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    data: { type: "column", columnId },
  });
  const meta = COLUMN_META[columnId];
  const ids = cards.map((card) => card.id);

  return (
    <section
      data-column={columnId}
      className={cn(
        "lane-slide flex h-full min-h-0 flex-col rounded-column bg-surface p-2",
        "transition-[box-shadow,background-color] duration-150 ease-[var(--ease-smooth-out)]",
        isOver && "bg-elevated/80 ring-1 ring-primary/70",
      )}
      aria-label={`${meta.label}${projectName ? `, ${projectName}` : ""}, ${cards.length} ${cards.length === 1 ? "task" : "tasks"}`}
    >
      <header className="flex items-center gap-2 px-1.5 pt-1 pb-2 md:px-2 md:pt-1.5">
        <span
          className={cn("size-2 shrink-0 rounded-full", meta.tone)}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-medium text-fg">{meta.label}</h2>
          <p className="hidden text-xs text-subtle sm:block">{meta.hint}</p>
        </div>
        <span
          className="rounded-full bg-elevated px-2 py-0.5 text-xs font-medium text-muted tabular-nums"
          aria-hidden="true"
        >
          {cards.length}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-11 text-muted md:size-8"
          onClick={() => onAdd(columnId)}
          aria-label={`Add card to ${meta.label}`}
        >
          <Plus className="size-4" />
        </Button>
      </header>

      <div
        ref={setNodeRef}
        className="ink-scroll lane-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain px-0.5 py-1"
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <SortableKanbanCard
              key={card.id}
              card={card}
              columnId={columnId}
              selectedTags={selectedTags}
              dragDisabled={dragDisabled}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
              onToggleTag={onToggleTag}
            />
          ))}
        </SortableContext>

        {cards.length === 0 ? (
          <button
            type="button"
            onClick={() => onAdd(columnId)}
            className={cn(
              "flex min-h-32 flex-1 flex-col items-center justify-center gap-1 rounded-md px-4 text-center",
              "shadow-[inset_0_0_0_1px_var(--color-border)]",
              "text-sm text-muted transition-[color,background-color] duration-150 ease-out",
              "hover:bg-elevated/50 hover:text-fg",
            )}
          >
            <span className="font-medium">
              {filtering && !empty ? "No matches here" : "Nothing here yet"}
            </span>
            <span className="text-xs text-subtle">
              {filtering && !empty
                ? "Try another filter"
                : "Drop a card or add one"}
            </span>
          </button>
        ) : null}
      </div>
    </section>
  );
}
