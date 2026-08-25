import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type TagChipProps = {
  label: string;
  selected?: boolean;
  size?: "sm" | "md" | "card";
  onSelect?: () => void;
  onRemove?: () => void;
};

export function TagChip({
  label,
  selected = false,
  size = "sm",
  onSelect,
  onRemove,
}: TagChipProps) {
  const cardChip = size === "card";
  const classes = cn(
    "inline-flex max-w-full shrink-0 items-center gap-1 rounded-full font-medium",
    "transition-[background-color,color,box-shadow] duration-150 ease-out",
    cardChip ? "kanban-card-chip" : size === "sm" ? "h-7 px-2 text-xs" : "h-9 px-3 text-sm",
    !cardChip && selected
      ? "bg-primary text-primary-fg"
      : !cardChip
        ? "bg-elevated text-muted shadow-[var(--shadow-border)]"
        : null,
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(classes, "hover:text-fg")}
      >
        <span className="truncate">{label}</span>
      </button>
    );
  }

  if (onRemove) {
    return (
      <span className={classes}>
        <span className="truncate">{label}</span>
        <button
          type="button"
          onClick={onRemove}
          className="flex size-5 items-center justify-center rounded-full text-current hover:bg-surface/40"
          aria-label={`Remove ${label}`}
        >
          <X className="size-3" />
        </button>
      </span>
    );
  }

  return (
    <span className={classes}>
      <span className="truncate">{label}</span>
    </span>
  );
}
