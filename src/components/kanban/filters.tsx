import { Check, FolderKanban, Search, Tags, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { Project } from "@/lib/board/types";
import { cn } from "@/lib/utils";

type BoardFiltersProps = {
  query: string;
  tags: string[];
  selectedTags: string[];
  projects: Project[];
  selectedProjectId: string | null;
  onQueryChange: (value: string) => void;
  onToggleTag: (tag: string) => void;
  onSelectProject: (id: string | null) => void;
  onClearTags: () => void;
};

export function BoardFilters({
  query,
  tags,
  selectedTags,
  projects,
  selectedProjectId,
  onQueryChange,
  onToggleTag,
  onSelectProject,
  onClearTags,
}: BoardFiltersProps) {
  const [tagOpen, setTagOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search titles, links, and tags"
          aria-label="Search cards"
          className="pr-11 pl-10"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-sm text-subtle hover:bg-surface hover:text-fg"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {projects.length > 0 ? (
        <DropdownMenu open={projectOpen} onOpenChange={setProjectOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="relative"
              aria-label={
                selectedProjectId
                  ? `Filter by project, ${projects.find((project) => project.id === selectedProjectId)?.name ?? "selected"}`
                  : "Filter by project"
              }
            >
              <FolderKanban className="size-4" />
              {selectedProjectId ? (
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Project</DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                onSelectProject(null);
              }}
            >
              <Check
                className={cn(
                  "size-4",
                  selectedProjectId ? "opacity-0" : "opacity-100",
                )}
              />
              All projects
            </DropdownMenuItem>
            {projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onSelect={(event) => {
                  event.preventDefault();
                  onSelectProject(
                    selectedProjectId === project.id ? null : project.id,
                  );
                }}
              >
                <Check
                  className={cn(
                    "size-4",
                    selectedProjectId === project.id
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                {project.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      {tags.length > 0 ? (
        <DropdownMenu open={tagOpen} onOpenChange={setTagOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="relative"
              aria-label={
                selectedTags.length > 0
                  ? `Filter by tag, ${selectedTags.length} selected`
                  : "Filter by tag"
              }
            >
              <Tags className="size-4" />
              {selectedTags.length > 0 ? (
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Tags</DropdownMenuLabel>
            <div className="max-h-60 overflow-y-auto">
              {tags.map((tag) => {
                const checked = selectedTags.some(
                  (item) => item.toLowerCase() === tag.toLowerCase(),
                );
                return (
                  <DropdownMenuCheckboxItem
                    key={tag.toLowerCase()}
                    checked={checked}
                    onSelect={(event) => {
                      event.preventDefault();
                      onToggleTag(tag);
                    }}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={selectedTags.length === 0}
              onSelect={(event) => {
                event.preventDefault();
                onClearTags();
              }}
            >
              Clear tags
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}
