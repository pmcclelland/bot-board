import { BOARD_COLUMN_IDS, COLUMN_META, type ColumnId } from "@/lib/board/types";
import { cn } from "@/lib/utils";

type LaneSwitcherProps = {
  active: ColumnId;
  counts: Record<ColumnId, number>;
  onSelect: (id: ColumnId) => void;
};

export function LaneSwitcher({ active, counts, onSelect }: LaneSwitcherProps) {
  return (
    <div
      className="grid grid-cols-3 gap-1 rounded-md bg-elevated p-1 shadow-[var(--shadow-border)] md:hidden"
      role="tablist"
      aria-label="Board lanes"
    >
      {BOARD_COLUMN_IDS.map((id) => {
        const selected = active === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(id)}
            className={cn(
              "flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-sm px-1 text-sm font-medium",
              "transition-[background-color,color] duration-150 ease-out",
              selected
                ? "bg-surface text-fg shadow-[var(--shadow-border)]"
                : "text-muted",
            )}
          >
            <span
              className={cn("size-1.5 shrink-0 rounded-full", COLUMN_META[id].tone)}
              aria-hidden="true"
            />
            <span className="truncate">{COLUMN_META[id].label}</span>
            <span className="tabular-nums text-subtle">{counts[id]}</span>
          </button>
        );
      })}
    </div>
  );
}
