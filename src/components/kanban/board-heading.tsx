type BoardHeadingProps = {
  projectName: string | null;
  visible: number;
  total: number;
  filtering: boolean;
};

function taskCountLabel(visible: number, total: number, filtering: boolean) {
  const unit = total === 1 ? "task" : "tasks";
  return filtering ? `${visible} of ${total} ${unit}` : `${total} ${unit}`;
}

export function BoardHeading({
  projectName,
  visible,
  total,
  filtering,
}: BoardHeadingProps) {
  const count = taskCountLabel(visible, total, filtering);

  return (
    <div
      className="flex min-w-0 items-baseline gap-3 px-0.5 md:px-1"
      aria-live="polite"
    >
      {projectName ? (
        <h2 className="min-w-0 truncate font-display text-xl leading-none font-semibold tracking-[0.04em] text-fg md:text-2xl">
          {projectName}
        </h2>
      ) : null}
      <p className="shrink-0 text-sm text-subtle tabular-nums">{count}</p>
    </div>
  );
}
