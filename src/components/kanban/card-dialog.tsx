import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { parseUrl, uniqueTags } from "@/lib/board/card-fields";
import {
  COLUMN_IDS,
  COLUMN_META,
  MAX_TAGS,
  type ColumnId,
  type Project,
} from "@/lib/board/types";
import { cn } from "@/lib/utils";
import { TagChip } from "./tag-chip";

export type CardDraft = {
  title: string;
  description: string;
  url: string;
  tags: string[];
  columnId: ColumnId;
  projectId: string;
};

type CardDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initial: CardDraft;
  suggestions: string[];
  projects: Project[];
  onCreateProject?: (name: string) => string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (draft: CardDraft) => void;
};

export function CardDialog({
  open,
  mode,
  initial,
  suggestions,
  projects,
  onCreateProject,
  onOpenChange,
  onSubmit,
}: CardDialogProps) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [url, setUrl] = useState(initial.url);
  const [tags, setTags] = useState<string[]>(initial.tags);
  const [tagDraft, setTagDraft] = useState("");
  const [columnId, setColumnId] = useState<ColumnId>(initial.columnId);
  const [projectId, setProjectId] = useState(initial.projectId);
  const [newProject, setNewProject] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(initial.title);
    setDescription(initial.description);
    setUrl(initial.url);
    setTags(initial.tags);
    setTagDraft("");
    setColumnId(initial.columnId);
    setProjectId(initial.projectId);
    setNewProject("");
    setError(null);
    setUrlError(null);
  }, [open, initial]);

  function addTag(raw: string) {
    const next = uniqueTags([...tags, raw]);
    setTags(next);
    setTagDraft("");
  }

  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      if (tagDraft.trim()) addTag(tagDraft);
    }
    if (event.key === "Backspace" && !tagDraft && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) {
      setError("A title is required.");
      return;
    }
    const parsed = parseUrl(url);
    if (!parsed.ok) {
      setUrlError("Use a web link, starting with http or https.");
      return;
    }
    let nextProjectId = projectId || projects[0]?.id || "";
    if (newProject.trim() && onCreateProject) {
      const created = onCreateProject(newProject.trim());
      if (created) nextProjectId = created;
    }
    onSubmit({
      title: nextTitle,
      description: description.trim(),
      url: parsed.url,
      tags: uniqueTags([...tags, tagDraft]),
      columnId,
      projectId: nextProjectId,
    });
    onOpenChange(false);
  }

  const unusedSuggestions = suggestions.filter(
    (tag) => !tags.some((item) => item.toLowerCase() === tag.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "New card" : "Edit card"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Give the work a name, a link if it has one, and the tags that belong with it."
                : "Update the notes, link, tags, or move it to another lane."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="card-title">Title</Label>
              <Input
                id="card-title"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  if (error) setError(null);
                }}
                placeholder="What needs to happen?"
                maxLength={120}
                autoFocus
                aria-invalid={Boolean(error)}
              />
              {error ? (
                <p className="text-sm text-danger" role="alert">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="card-description">Description</Label>
              <Textarea
                id="card-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional notes, context, or next steps."
                maxLength={600}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="card-url">Link</Label>
              <Input
                id="card-url"
                type="text"
                inputMode="url"
                autoComplete="url"
                value={url}
                onChange={(event) => {
                  setUrl(event.target.value);
                  if (urlError) setUrlError(null);
                }}
                placeholder="https://"
                aria-invalid={Boolean(urlError)}
              />
              {urlError ? (
                <p className="text-sm text-danger" role="alert">
                  {urlError}
                </p>
              ) : (
                <p className="text-xs text-subtle">Optional. Opens in a new tab.</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="card-tags">Tags</Label>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <TagChip
                    key={tag.toLowerCase()}
                    label={tag}
                    onRemove={() =>
                      setTags(tags.filter((item) => item.toLowerCase() !== tag.toLowerCase()))
                    }
                  />
                ))}
              </div>
              <Input
                id="card-tags"
                value={tagDraft}
                onChange={(event) => setTagDraft(event.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => {
                  if (tagDraft.trim()) addTag(tagDraft);
                }}
                placeholder={
                  tags.length >= MAX_TAGS
                    ? "Tag limit reached"
                    : "Type a tag, then Enter"
                }
                maxLength={24}
                disabled={tags.length >= MAX_TAGS}
              />
              {unusedSuggestions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {unusedSuggestions.map((tag) => (
                    <TagChip
                      key={tag.toLowerCase()}
                      label={tag}
                      onSelect={() => addTag(tag)}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium text-fg">Project</legend>
              <div className="flex flex-wrap gap-1.5 rounded-md bg-elevated p-1 shadow-[var(--shadow-border)]">
                {projects.map((project) => {
                  const selected = projectId === project.id;
                  return (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => setProjectId(project.id)}
                      className={cn(
                        "flex h-11 min-w-0 flex-1 items-center justify-center rounded-sm px-3 text-sm font-medium transition-[background-color,color] duration-150 ease-out",
                        selected
                          ? "bg-surface text-fg shadow-[var(--shadow-border)]"
                          : "text-muted hover:text-fg",
                      )}
                      aria-pressed={selected}
                    >
                      <span className="truncate">{project.name}</span>
                    </button>
                  );
                })}
              </div>
              {onCreateProject ? (
                <Input
                  value={newProject}
                  onChange={(event) => setNewProject(event.target.value)}
                  placeholder="Or add a project"
                  maxLength={32}
                  aria-label="New project name"
                />
              ) : null}
            </fieldset>

            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium text-fg">Column</legend>
              <div className="grid grid-cols-3 gap-1.5 rounded-md bg-elevated p-1 shadow-[var(--shadow-border)]">
                {COLUMN_IDS.map((id) => {
                  const selected = columnId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setColumnId(id)}
                      className={cn(
                        "flex h-11 items-center justify-center rounded-sm text-sm font-medium transition-[background-color,color] duration-150 ease-out",
                        selected
                          ? "bg-surface text-fg shadow-[var(--shadow-border)]"
                          : "text-muted hover:text-fg",
                      )}
                      aria-pressed={selected}
                    >
                      {COLUMN_META[id].label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {mode === "create" ? "Add card" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
