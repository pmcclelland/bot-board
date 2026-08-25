import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { parseUrl, uniqueTags } from "@/lib/board/card-fields";
import {
  firstCardFormError,
  validateCardForm,
} from "@/lib/board/card-form";
import {
  COLUMN_IDS,
  COLUMN_META,
  MAX_TAGS,
  type ColumnId,
  type Person,
  type Project,
} from "@/lib/board/types";
import { cn } from "@/lib/utils";
import { AssigneeSelect } from "./assignee-select";
import { ProjectSelect } from "./project-select";
import { TagChip } from "./tag-chip";

type FieldKey = "title" | "description" | "url" | "columnId";

function FieldLabel({
  htmlFor,
  id,
  required,
  optional,
  children,
}: {
  htmlFor?: string;
  id?: string;
  required?: boolean;
  optional?: boolean;
  children: string;
}) {
  return (
    <Label htmlFor={htmlFor} id={id} className="flex items-baseline gap-2">
      <span>
        {children}
        {required ? (
          <span className="text-subtle" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </span>
      {optional ? (
        <span className="text-xs font-normal text-subtle">Optional</span>
      ) : null}
    </Label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm text-danger" role="alert">
      {message}
    </p>
  );
}

export type CardDraft = {
  title: string;
  description: string;
  url: string;
  tags: string[];
  columnId: ColumnId;
  projectId: string;
  assigneeId: string;
  creator?: string;
};

type CardDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initial: CardDraft;
  suggestions: string[];
  projects: Project[];
  people: Person[];
  onCreateProject?: (name: string) => string | null | Promise<string | null>;
  onOpenChange: (open: boolean) => void;
  onSubmit: (draft: CardDraft) => void;
};

export function CardDialog({
  open,
  mode,
  initial,
  suggestions,
  projects,
  people,
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
  const [assigneeId, setAssigneeId] = useState(initial.assigneeId);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>(
    {},
  );
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(initial.title);
    setDescription(initial.description);
    setUrl(initial.url);
    setTags(initial.tags);
    setTagDraft("");
    setColumnId(initial.columnId);
    setProjectId(initial.projectId);
    setAssigneeId(initial.assigneeId);
    setTouched({});
    setSubmitted(false);
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

  function markTouched(field: FieldKey) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function shownError(field: FieldKey) {
    if (!(submitted || touched[field])) return undefined;
    return errors[field];
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    const nextErrors = validateCardForm({
      title,
      description,
      url,
      columnId,
    });
    const first = firstCardFormError(nextErrors);
    if (first) {
      const focusId = {
        title: "card-title",
        description: "card-description",
        url: "card-url",
        columnId: "card-column-todo",
      }[first];
      document.getElementById(focusId)?.focus();
      return;
    }
    const parsed = parseUrl(url);
    if (!parsed.ok) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      url: parsed.url,
      tags: uniqueTags([...tags, tagDraft]),
      columnId,
      projectId: projectId.trim(),
      assigneeId: assigneeId.trim(),
    });
    onOpenChange(false);
  }

  const unusedSuggestions = suggestions.filter(
    (tag) => !tags.some((item) => item.toLowerCase() === tag.toLowerCase()),
  );
  const errors = validateCardForm({ title, description, url, columnId });
  const titleError = shownError("title");
  const descriptionError = shownError("description");
  const urlError = shownError("url");
  const columnError = shownError("columnId");

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "New task" : "Edit task"}
      description={
        mode === "create"
          ? "Name and describe the work. Assignee, link, tags, and project are optional."
          : initial.creator
            ? `Created by ${initial.creator}. Update the notes, assignee, or lane.`
            : "Update the notes, assignee, link, tags, or move it to another lane."
      }
      onSubmit={handleSubmit}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit">
            {mode === "create" ? "Add task" : "Save changes"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
            <div className="grid gap-2">
              <FieldLabel htmlFor="card-title" required>
                Title
              </FieldLabel>
              <Input
                id="card-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onBlur={() => markTouched("title")}
                placeholder="What needs to happen?"
                maxLength={120}
                autoFocus
                aria-required
                aria-invalid={Boolean(titleError)}
                aria-describedby={titleError ? "card-title-error" : undefined}
              />
              <FieldError id="card-title-error" message={titleError} />
            </div>

            <div className="grid gap-2">
              <FieldLabel htmlFor="card-description" required>
                Description
              </FieldLabel>
              <Textarea
                id="card-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                onBlur={() => markTouched("description")}
                placeholder="Notes, context, or next steps."
                maxLength={600}
                aria-required
                aria-invalid={Boolean(descriptionError)}
                aria-describedby={
                  descriptionError ? "card-description-error" : undefined
                }
              />
              <FieldError
                id="card-description-error"
                message={descriptionError}
              />
            </div>

            <div className="grid gap-2">
              <FieldLabel htmlFor="card-assignee" optional>
                Assignee
              </FieldLabel>
              <AssigneeSelect
                id="card-assignee"
                people={people}
                value={assigneeId}
                onChange={setAssigneeId}
              />
            </div>

            <div className="grid gap-2">
              <FieldLabel htmlFor="card-url" optional>
                Link
              </FieldLabel>
              <Input
                id="card-url"
                type="text"
                inputMode="url"
                autoComplete="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                onBlur={() => markTouched("url")}
                placeholder="https://example.com"
                spellCheck={false}
                aria-invalid={Boolean(urlError)}
                aria-describedby={
                  urlError ? "card-url-error" : "card-url-hint"
                }
              />
              <FieldError id="card-url-error" message={urlError} />
              {!urlError ? (
                <p id="card-url-hint" className="text-xs text-subtle">
                  Opens in a new tab.
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <FieldLabel htmlFor="card-tags" optional>
                Tags
              </FieldLabel>
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <TagChip
                      key={tag.toLowerCase()}
                      label={tag}
                      onRemove={() =>
                        setTags(
                          tags.filter(
                            (item) => item.toLowerCase() !== tag.toLowerCase(),
                          ),
                        )
                      }
                    />
                  ))}
                </div>
              ) : null}
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

            <div className="grid gap-2">
              <FieldLabel htmlFor="card-project" optional>
                Project
              </FieldLabel>
              <ProjectSelect
                id="card-project"
                projects={projects}
                value={projectId}
                onChange={setProjectId}
                onCreate={onCreateProject}
              />
            </div>

            <div className="grid gap-2">
              <FieldLabel id="card-column-label" required>
                Column
              </FieldLabel>
              <div
                className={cn(
                  "grid grid-cols-3 gap-1.5 rounded-md bg-elevated p-1 shadow-[var(--shadow-border)]",
                  columnError && "ring-2 ring-danger/70",
                )}
                role="group"
                aria-labelledby="card-column-label"
                aria-required
                aria-invalid={Boolean(columnError)}
                aria-describedby={
                  columnError ? "card-column-error" : undefined
                }
              >
                {COLUMN_IDS.map((id) => {
                  const selected = columnId === id;
                  return (
                    <button
                      key={id}
                      id={id === "todo" ? "card-column-todo" : undefined}
                      type="button"
                      onClick={() => {
                        setColumnId(id);
                        markTouched("columnId");
                      }}
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
              <FieldError id="card-column-error" message={columnError} />
            </div>
          </div>
    </Modal>
  );
}
