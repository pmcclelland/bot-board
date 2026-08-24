import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  GripVertical,
  Link2,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type Ref } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { linkLabel, parseUrl } from "@/lib/board/card-fields";
import {
  COLUMN_IDS,
  COLUMN_META,
  type Card,
  type ColumnId,
} from "@/lib/board/types";
import { cn } from "@/lib/utils";
import { TagChip } from "./tag-chip";

type KanbanCardProps = {
  card: Card;
  columnId?: ColumnId;
  isOverlay?: boolean;
  selectedTags?: string[];
  dragDisabled?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onMove?: (id: string, columnId: ColumnId) => void;
  onToggleTag?: (tag: string) => void;
};

function stopDrag(event: { stopPropagation: () => void }) {
  event.stopPropagation();
}

export function KanbanCardView({
  card,
  columnId,
  isOverlay,
  isDragging,
  selectedTags = [],
  dragDisabled,
  handleProps,
  onEdit,
  onDelete,
  onMove,
  onToggleTag,
}: KanbanCardProps & {
  isDragging?: boolean;
  handleProps?: HTMLAttributes<HTMLButtonElement> & {
    ref?: Ref<HTMLButtonElement>;
  };
}) {
  const [stamped, setStamped] = useState("");
  const href = parseUrl(card.url);
  const safeUrl = href.ok && href.url ? href.url : null;

  useEffect(() => {
    try {
      const date = new Date(card.updatedAt);
      if (Number.isNaN(date.getTime())) return;
      setStamped(formatDistanceToNow(date, { addSuffix: true }));
    } catch {
      setStamped("");
    }
  }, [card.updatedAt]);
  const destinations = COLUMN_IDS.filter((id) => id !== columnId);
  const canDrag = !dragDisabled && !isOverlay;

  return (
    <article
      className={cn(
        "group rounded-md bg-card p-3 shadow-[var(--shadow-card)]",
        "transition-[box-shadow,opacity,transform] duration-150 ease-[var(--ease-smooth-out)]",
        "hover:shadow-[var(--shadow-border-hover)]",
        canDrag && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-0",
        isOverlay &&
          "max-w-sm rotate-1 scale-[1.02] cursor-grabbing shadow-[var(--shadow-lift)]",
      )}
    >
      <div className="flex items-start gap-1">
        <button
          type="button"
          suppressHydrationWarning
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-sm text-subtle",
            "transition-[color,background-color] duration-150 ease-out",
            canDrag && "cursor-grab active:cursor-grabbing",
            isOverlay && "cursor-grabbing",
            dragDisabled && "cursor-default opacity-30",
          )}
          aria-label={`Reorder ${card.title}`}
          {...handleProps}
        >
          <GripVertical className="size-4" />
        </button>

        <div className="min-w-0 flex-1">
          <div
            role="button"
            tabIndex={0}
            onClick={() => onEdit(card.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onEdit(card.id);
              }
            }}
            className={cn(
              "w-full rounded-sm py-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
              canDrag && "cursor-grab active:cursor-grabbing",
            )}
          >
            <h3 className="text-sm font-medium leading-snug text-balance text-fg">
              {card.title}
            </h3>
            {card.description ? (
              <p className="mt-1 line-clamp-3 text-sm leading-normal text-pretty text-muted">
                {card.description}
              </p>
            ) : null}
          </div>

          {safeUrl ? (
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex max-w-full items-center gap-1.5 text-xs text-muted hover:text-fg"
              onClick={stopDrag}
              onPointerDown={stopDrag}
              onTouchStart={stopDrag}
            >
              <Link2 className="size-3.5 shrink-0" />
              <span className="truncate">{linkLabel(safeUrl)}</span>
            </a>
          ) : null}

          {card.tags.length > 0 ? (
            <div
              className="mt-2 flex flex-wrap gap-1"
              onPointerDown={stopDrag}
              onTouchStart={stopDrag}
            >
              {card.tags.map((tag) => (
                <TagChip
                  key={tag.toLowerCase()}
                  label={tag}
                  selected={selectedTags.some(
                    (item) => item.toLowerCase() === tag.toLowerCase(),
                  )}
                  onSelect={onToggleTag ? () => onToggleTag(tag) : undefined}
                />
              ))}
            </div>
          ) : null}

          {card.assignee ? (
            <p className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-fg">
              <UserRound className="size-3.5 shrink-0 text-muted" />
              <span className="truncate">{card.assignee}</span>
            </p>
          ) : null}

          {card.creator || stamped ? (
            <p
              className={cn(
                "text-xs text-subtle",
                card.assignee ? "mt-1.5" : "mt-2",
              )}
            >
              {card.creator ? `by ${card.creator}` : null}
              {card.creator && stamped ? " · " : null}
              {stamped ? (
                <span className="tabular-nums">{stamped}</span>
              ) : null}
            </p>
          ) : null}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-11 shrink-0 cursor-pointer text-subtle opacity-100 md:size-8 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
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
                  <DropdownMenuItem
                    key={id}
                    onSelect={() => onMove(card.id, id)}
                  >
                    <ArrowRight className="size-4" />
                    Move to {COLUMN_META[id].label}
                  </DropdownMenuItem>
                ))
              : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="danger"
              onSelect={() => onDelete(card.id)}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}

export function SortableKanbanCard({
  card,
  columnId,
  selectedTags,
  dragDisabled,
  onEdit,
  onDelete,
  onMove,
  onToggleTag,
}: KanbanCardProps) {
  const dragOccurred = useRef(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
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
      {...(dragDisabled ? {} : listeners)}
      className={cn(isDragging && "z-10")}
    >
      <KanbanCardView
        card={card}
        columnId={columnId}
        isDragging={isDragging}
        selectedTags={selectedTags}
        dragDisabled={dragDisabled}
        onEdit={handleEdit}
        onDelete={onDelete}
        onMove={onMove}
        onToggleTag={onToggleTag}
        handleProps={{
          ref: setActivatorNodeRef,
          ...attributes,
        }}
      />
    </div>
  );
}
