import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowRight, Link2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
  onEdit,
  onDelete,
  onMove,
  onToggleTag,
}: KanbanCardProps & {
  isDragging?: boolean;
}) {
  const [stamped, setStamped] = useState("");
  const href = parseUrl(card.url);
  const safeUrl = href.ok && href.url ? href.url : null;

  useEffect(() => {
    setStamped(formatCompactAge(card.updatedAt));
  }, [card.updatedAt]);
  const destinations = COLUMN_IDS.filter((id) => id !== columnId);
  const canDrag = !dragDisabled && !isOverlay;
  const showFace = Boolean(card.assignee);
  const showTags = card.tags.length > 0;
  const showLink = Boolean(safeUrl);
  const showFooter = showFace || showTags || showLink || Boolean(stamped);

  return (
    <article
      className={cn(
        "group flex flex-col rounded-md bg-card p-4",
        "transition-[opacity,transform] duration-150 ease-[var(--ease-smooth-out)]",
        canDrag && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-0",
        isOverlay && "max-w-sm rotate-1 scale-[1.02] cursor-grabbing shadow-[var(--shadow-lift)]",
      )}
    >
      <div className="flex items-start gap-1">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onEdit(card.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                onEdit(card.id);
              }
            }}
            className="w-full cursor-pointer rounded-sm py-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
          >
            <h3 className="line-clamp-2 text-base leading-snug font-semibold text-balance text-fg">
              {card.title}
            </h3>
            {card.description ? (
              <p className="text-dek mt-2 line-clamp-2 font-normal text-pretty text-muted">
                {card.description}
              </p>
            ) : null}
          </button>
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
      </div>

      {showFooter ? (
        <div className="mt-3 flex items-center gap-2">
          {showFace ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="grid size-6 shrink-0 place-items-center overflow-hidden rounded-full bg-elevated text-chip font-semibold text-fg shadow-[var(--shadow-hairline)] outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
                  aria-label={`Assignee, ${card.assignee}`}
                  onPointerDown={stopDrag}
                  onTouchStart={stopDrag}
                >
                  {card.assigneeImage ? (
                    <img
                      src={card.assigneeImage}
                      alt=""
                      className="size-6 rounded-full object-cover"
                    />
                  ) : (
                    card.assignee.charAt(0).toUpperCase()
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                Assignee
              </TooltipContent>
            </Tooltip>
          ) : null}

          {showTags ? (
            <div
              className="flex min-w-0 items-center gap-2 overflow-hidden"
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

          {showLink && safeUrl ? (
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-3.5 shrink-0 items-center justify-center text-muted hover:text-fg"
              aria-label={`Open ${linkLabel(safeUrl)}`}
              onClick={stopDrag}
              onPointerDown={stopDrag}
              onTouchStart={stopDrag}
            >
              <Link2 className="size-3.5" />
            </a>
          ) : null}

          {stamped ? (
            <p className="ml-auto shrink-0 text-xs font-normal text-muted tabular-nums">
              {stamped}
            </p>
          ) : null}
        </div>
      ) : null}
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
      />
    </div>
  );
}
