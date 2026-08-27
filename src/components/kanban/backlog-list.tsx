import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, Link2, MoreHorizontal, Pencil, Plus, Trash2, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCompactAge, linkLabel, parseUrl } from "@/lib/board/card-fields";
import { COLUMN_IDS, COLUMN_META, type Card, type ColumnId } from "@/lib/board/types";
import { cn } from "@/lib/utils";
import { TagChip } from "./tag-chip";

type BacklogListProps = {
  cards: Card[];
  empty: boolean;
  filtering: boolean;
  selectedTags: string[];
  dragDisabled: boolean;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, columnId: ColumnId) => void;
  onToggleTag: (tag: string) => void;
};

function stopDrag(event: { stopPropagation: () => void }) {
  event.stopPropagation();
}

export function BacklogCardView({
  card,
  isOverlay,
  isDragging,
  selectedTags = [],
  dragDisabled,
  onEdit,
  onDelete,
  onMove,
  onToggleTag,
}: {
  card: Card;
  isOverlay?: boolean;
  isDragging?: boolean;
  selectedTags?: string[];
  dragDisabled?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onMove?: (id: string, columnId: ColumnId) => void;
  onToggleTag?: (tag: string) => void;
}) {
  const [stamped, setStamped] = useState("");
  const href = parseUrl(card.url);
  const safeUrl = href.ok && href.url ? href.url : null;
  const destinations = COLUMN_IDS.filter((id) => id !== "backlog");
  const canDrag = !dragDisabled && !isOverlay;

  useEffect(() => {
    setStamped(formatCompactAge(card.updatedAt));
  }, [card.updatedAt]);

  return (
    <article
      className={cn(
        "group flex w-full items-center gap-2 rounded-md bg-card px-3 py-2",
        "transition-[opacity,transform] duration-150 ease-[var(--ease-smooth-out)]",
        canDrag && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-0",
        isOverlay && "cursor-grabbing shadow-[var(--shadow-lift)]",
      )}
    >
      <button
        type="button"
        onClick={() => onEdit(card.id)}
        className={cn(
          "min-w-0 flex-1 truncate text-left text-sm font-semibold text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
          canDrag && "cursor-grab active:cursor-grabbing",
        )}
      >
        {card.title}
      </button>

      {safeUrl ? (
        <a
          href={safeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex size-8 shrink-0 items-center justify-center text-muted hover:text-fg"
          aria-label={`Open ${linkLabel(safeUrl)}`}
          onClick={stopDrag}
          onPointerDown={stopDrag}
          onTouchStart={stopDrag}
        >
          <Link2 className="size-3.5" />
        </a>
      ) : null}

      {card.tags.length > 0 ? (
        <div
          className="hidden min-w-0 items-center gap-1 overflow-hidden sm:flex"
          onPointerDown={stopDrag}
          onTouchStart={stopDrag}
        >
          {card.tags.map((tag) => (
            <TagChip
              key={tag.toLowerCase()}
              label={tag}
              size="card"
              selected={selectedTags.some((item) => item.toLowerCase() === tag.toLowerCase())}
              onSelect={onToggleTag ? () => onToggleTag(tag) : undefined}
            />
          ))}
        </div>
      ) : null}

      {card.assignee ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="grid size-6 shrink-0 place-items-center overflow-hidden rounded-full bg-elevated text-chip font-semibold text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
              aria-label={card.assignee}
              onPointerDown={stopDrag}
              onTouchStart={stopDrag}
            >
              {card.assigneeImage ? (
                <img src={card.assigneeImage} alt="" className="size-6 rounded-full object-cover" />
              ) : (
                card.assignee.charAt(0).toUpperCase()
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{card.assignee}</TooltipContent>
        </Tooltip>
      ) : null}

      {stamped ? (
        <p className="shrink-0 text-xs font-normal text-muted tabular-nums">{stamped}</p>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-8 shrink-0 text-subtle"
            aria-label={`Actions for ${card.title}`}
            static
            onPointerDown={stopDrag}
            onTouchStart={stopDrag}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onEdit(card.id)}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          {onMove
            ? destinations.map((id) => (
                <DropdownMenuItem key={id} onSelect={() => onMove(card.id, id)}>
                  <ArrowRight className="size-4" />
                  Move to {COLUMN_META[id].label}
                </DropdownMenuItem>
              ))
            : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="danger" onSelect={() => onDelete(card.id)}>
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </article>
  );
}

function SortableBacklogCard({
  card,
  selectedTags,
  dragDisabled,
  onEdit,
  onDelete,
  onMove,
  onToggleTag,
}: {
  card: Card;
  selectedTags: string[];
  dragDisabled: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, columnId: ColumnId) => void;
  onToggleTag: (tag: string) => void;
}) {
  const dragOccurred = useRef(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    disabled: dragDisabled,
    data: { type: "card", card },
  });

  useEffect(() => {
    if (isDragging) dragOccurred.current = true;
  }, [isDragging]);

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleEdit(id: string) {
    if (dragOccurred.current) {
      dragOccurred.current = false;
      return;
    }
    onEdit(id);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(dragDisabled ? {} : { ...listeners, ...attributes })}
      className={cn(isDragging && "z-10")}
    >
      <BacklogCardView
        card={card}
        isDragging={isDragging}
        selectedTags={selectedTags}
        dragDisabled={dragDisabled}
        onEdit={handleEdit}
        onDelete={onDelete}
        onMove={onMove}
        onToggleTag={onToggleTag}
      />
    </div>
  );
}

export function BacklogList({
  cards,
  empty,
  filtering,
  selectedTags,
  dragDisabled,
  onAdd,
  onEdit,
  onDelete,
  onMove,
  onToggleTag,
}: BacklogListProps) {
  const [open, setOpen] = useState(true);
  const { setNodeRef, isOver } = useDroppable({
    id: "backlog",
    data: { type: "column", columnId: "backlog" },
  });
  const ids = cards.map((card) => card.id);

  return (
    <section
      ref={setNodeRef}
      data-column="backlog"
      className={cn(
        "shrink-0 rounded-column bg-surface p-2",
        "transition-[box-shadow,background-color] duration-150 ease-[var(--ease-smooth-out)]",
        isOver && "bg-elevated/80 ring-1 ring-primary/70",
      )}
      aria-label={`Backlog, ${cards.length} ${cards.length === 1 ? "task" : "tasks"}`}
    >
      <header className="flex items-center gap-2 px-1.5 py-1 md:px-2">
        <button
          type="button"
          className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-sm px-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/70 md:min-h-8"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted transition-transform duration-150 ease-out",
              !open && "rotate-[-90deg]",
            )}
            aria-hidden="true"
          />
          <span className={cn("size-2 shrink-0 rounded-full", COLUMN_META.backlog.tone)} aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-fg">
            {COLUMN_META.backlog.label}
          </span>
          <span className="rounded-full bg-elevated px-2 py-0.5 text-xs font-medium text-muted tabular-nums">
            {cards.length}
          </span>
        </button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-11 text-muted md:size-8"
          onClick={onAdd}
          aria-label="Add card to Backlog"
        >
          <Plus className="size-4" />
        </Button>
      </header>

      {open ? (
        <div className="ink-scroll lane-scroll flex max-h-56 flex-col gap-1 overflow-y-auto overscroll-contain px-0.5 py-1 md:max-h-64">
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {cards.map((card) => (
              <SortableBacklogCard
                key={card.id}
                card={card}
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
              onClick={onAdd}
              className={cn(
                "flex min-h-11 items-center justify-center rounded-md px-4 text-sm text-muted",
                "shadow-[inset_0_0_0_1px_var(--color-border)]",
                "transition-[color,background-color] duration-150 ease-out hover:bg-elevated/50 hover:text-fg",
              )}
            >
              {filtering && !empty ? "No matches here" : "Nothing parked yet"}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
