import { Check, ChevronDown } from "lucide-react";
import { useMemo, useState, type KeyboardEvent } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Project } from "@/lib/board/types";
import { cn } from "@/lib/utils";

type ProjectSelectProps = {
  id?: string;
  projects: Project[];
  value: string;
  onChange: (id: string) => void;
  tone?: "field" | "plain";
};

export function ProjectSelect({
  id,
  projects,
  value,
  onChange,
  tone = "field",
}: ProjectSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = projects.find((project) => project.id === value);
  const trimmed = query.trim();
  const matches = useMemo(() => {
    const needle = trimmed.toLowerCase();
    if (!needle) return projects;
    return projects.filter((project) =>
      project.name.toLowerCase().includes(needle),
    );
  }, [projects, trimmed]);

  function choose(nextId: string) {
    onChange(nextId);
    setQuery("");
    setOpen(false);
  }

  function handleQueryKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const exact = projects.find(
      (project) => project.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exact) {
      choose(exact.id);
      return;
    }
    if (matches.length === 1) choose(matches[0].id);
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
          aria-label="Project"
          className={cn(
            "flex w-full min-w-0 items-center text-left outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring/70",
            tone === "plain"
              ? "min-h-11 justify-start py-0 text-dek md:min-h-6"
              : "h-11 justify-between gap-2 rounded-sm bg-elevated px-3 text-base text-fg shadow-[var(--shadow-border)] transition-[box-shadow,background-color] duration-150 ease-out md:text-sm",
          )}
        >
          <span
            className={cn(
              "truncate",
              !selected && "text-subtle",
              tone === "plain" && selected && "text-fg",
            )}
          >
            {selected?.name ?? "No project"}
          </span>
          {tone === "field" ? (
            <ChevronDown className="size-4 shrink-0 text-subtle" />
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="flex w-[var(--radix-popover-trigger-width)] max-h-[var(--radix-popover-content-available-height)] flex-col p-1"
        align="start"
        collisionPadding={8}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleQueryKeyDown}
          placeholder="Search projects"
          className="h-10 w-full shrink-0 rounded-sm bg-elevated px-2.5 text-sm text-fg outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/70"
          aria-label="Search projects"
        />
        <div
          id="project-select-list"
          role="listbox"
          aria-label="Projects"
          className="mt-1 min-h-0 max-h-[min(13rem,var(--radix-popover-content-available-height,13rem))] overflow-y-auto"
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
          {matches.length === 0 ? (
            <p className="px-2.5 py-3 text-sm text-subtle">
              {projects.length === 0
                ? "Connect GitHub in Settings to use repositories as projects."
                : "No projects match"}
            </p>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
