import { Check, ChevronDown, Plus } from "lucide-react";
import { useMemo, useState, type KeyboardEvent } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MAX_PROJECT_NAME, type Project } from "@/lib/board/types";
import { cn } from "@/lib/utils";

type ProjectSelectProps = {
  id?: string;
  projects: Project[];
  value: string;
  onChange: (id: string) => void;
  onCreate?: (name: string) => string | null;
};

export function ProjectSelect({
  id,
  projects,
  value,
  onChange,
  onCreate,
}: ProjectSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = projects.find((project) => project.id === value);
  const trimmed = query.trim().slice(0, MAX_PROJECT_NAME);
  const matches = useMemo(() => {
    const needle = trimmed.toLowerCase();
    if (!needle) return projects;
    return projects.filter((project) =>
      project.name.toLowerCase().includes(needle),
    );
  }, [projects, trimmed]);
  const exactMatch = projects.some(
    (project) => project.name.toLowerCase() === trimmed.toLowerCase(),
  );
  const canCreate = Boolean(onCreate && trimmed && !exactMatch);

  function choose(id: string) {
    onChange(id);
    setQuery("");
    setOpen(false);
  }

  function createFromQuery() {
    if (!canCreate || !onCreate) return;
    const created = onCreate(trimmed);
    if (created) choose(created);
  }

  function handleQueryKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (exactMatch) {
        const match = projects.find(
          (project) => project.name.toLowerCase() === trimmed.toLowerCase(),
        );
        if (match) choose(match.id);
        return;
      }
      if (canCreate) {
        createFromQuery();
        return;
      }
      if (matches.length === 1) choose(matches[0].id);
    }
  }

  return (
    <Popover
      modal
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls="project-select-list"
          className={cn(
            "flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-sm bg-elevated px-3 text-left text-base text-fg shadow-[var(--shadow-border)] outline-none",
            "transition-[box-shadow,background-color] duration-150 ease-out",
            "focus-visible:ring-2 focus-visible:ring-ring/70 md:text-sm",
          )}
        >
          <span className={cn("truncate", !selected && "text-subtle")}>
            {selected?.name ?? "No project"}
          </span>
          <ChevronDown className="size-4 shrink-0 text-subtle" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-1"
        align="start"
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleQueryKeyDown}
          placeholder="Search or add a project"
          maxLength={MAX_PROJECT_NAME}
          className="h-10 w-full rounded-sm bg-elevated px-2.5 text-sm text-fg outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/70"
          aria-label="Search or add a project"
        />
        <div
          id="project-select-list"
          role="listbox"
          aria-label="Projects"
          className="mt-1 max-h-52 overflow-y-auto"
        >
          {!trimmed ? (
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onClick={() => choose("")}
              className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-sm px-2.5 text-left text-sm outline-none transition-[background-color] duration-150 ease-out hover:bg-elevated focus-visible:bg-elevated"
            >
              <Check
                className={cn(
                  "size-4 shrink-0",
                  value ? "opacity-0" : "opacity-100",
                )}
              />
              <span className="truncate text-muted">No project</span>
            </button>
          ) : null}
          {matches.map((project) => {
            const selectedProject = project.id === value;
            return (
              <button
                key={project.id}
                type="button"
                role="option"
                aria-selected={selectedProject}
                onClick={() => choose(project.id)}
                className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-sm px-2.5 text-left text-sm outline-none transition-[background-color] duration-150 ease-out hover:bg-elevated focus-visible:bg-elevated"
              >
                <Check
                  className={cn(
                    "size-4 shrink-0",
                    selectedProject ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="truncate">{project.name}</span>
              </button>
            );
          })}
          {matches.length === 0 && !canCreate ? (
            <p className="px-2.5 py-3 text-sm text-subtle">No projects match</p>
          ) : null}
          {canCreate ? (
            <button
              type="button"
              onClick={createFromQuery}
              className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-sm px-2.5 text-left text-sm outline-none transition-[background-color] duration-150 ease-out hover:bg-elevated focus-visible:bg-elevated"
            >
              <Plus className="size-4 shrink-0" />
              <span className="truncate">Create “{trimmed}”</span>
            </button>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
