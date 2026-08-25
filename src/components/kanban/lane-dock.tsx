import { useDroppable } from "@dnd-kit/core";
import { BOARD_COLUMN_IDS, COLUMN_META, dockId, type ColumnId } from "@/lib/board/types";
import { cn } from "@/lib/utils";

type LaneDockProps = {
  active: boolean;
};

function DockTarget({ columnId }: { columnId: ColumnId }) {
  const { setNodeRef, isOver } = useDroppable({
    id: dockId(columnId),
    data: { type: "dock", columnId },
  });
  const meta = COLUMN_META[columnId];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-14 flex-col items-center justify-center gap-1 rounded-md bg-elevated text-xs font-medium text-muted",
        "shadow-[var(--shadow-border)] transition-[background-color,color,box-shadow] duration-150 ease-out",
        isOver && "bg-card text-fg ring-1 ring-primary/70",
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.tone)} aria-hidden="true" />
      {meta.label}
    </div>
  );
}

export function LaneDock({ active }: LaneDockProps) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden",
        "transition-[opacity,transform] duration-150 ease-[var(--ease-smooth-out)]",
        active
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "translate-y-2 opacity-0",
      )}
      aria-hidden={!active}
    >
      <div className="rounded-lg bg-bg/90 p-2 shadow-[var(--shadow-lift)]">
        <p className="px-1 pb-2 text-center text-xs text-subtle">Drop on a lane</p>
        <div className="grid grid-cols-3 gap-2">
          {BOARD_COLUMN_IDS.map((id) => (
            <DockTarget key={id} columnId={id} />
          ))}
        </div>
      </div>
    </div>
  );
}
