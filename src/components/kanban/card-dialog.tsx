import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CardDraft } from "@/lib/board/card-draft";
import { useCardForm } from "@/lib/board/use-card-form";
import {
  COLUMN_IDS,
  COLUMN_META,
  MAX_TAGS,
  type Person,
  type Project,
} from "@/lib/board/types";
import { cn } from "@/lib/utils";
import { AssigneeSelect } from "./assignee-select";
import { ProjectSelect } from "./project-select";
import { TagChip } from "./tag-chip";

export type { CardDraft };

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

type CardDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initial: CardDraft;
  suggestions: string[];
  projects: Project[];
  people: Person[];
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
  onOpenChange,
  onSubmit,
}: CardDialogProps) {
  const form = useCardForm({ open, initial, onSubmit, onOpenChange });
  const titleError = form.shownError("title");
  const descriptionError = form.shownError("description");
  const urlError = form.shownError("url");
  const columnError = form.shownError("columnId");
  const unusedSuggestions = suggestions.filter(
    (tag) => !form.tags.some((item) => item.toLowerCase() === tag.toLowerCase()),
  );

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
      onSubmit={form.handleSubmit}
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
                value={form.title}
                onChange={(event) => form.setTitle(event.target.value)}
                onBlur={() => form.markTouched("title")}
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
                value={form.description}
                onChange={(event) => form.setDescription(event.target.value)}
                onBlur={() => form.markTouched("description")}
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
                value={form.assigneeId}
                onChange={form.setAssigneeId}
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
                value={form.url}
                onChange={(event) => form.setUrl(event.target.value)}
                onBlur={() => form.markTouched("url")}
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
              {form.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {form.tags.map((tag) => (
                    <TagChip
                      key={tag.toLowerCase()}
                      label={tag}
                      onRemove={() =>
                        form.setTags(
                          form.tags.filter(
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
                value={form.tagDraft}
                onChange={(event) => form.setTagDraft(event.target.value)}
                onKeyDown={form.handleTagKeyDown}
                onBlur={() => {
                  if (form.tagDraft.trim()) form.addTag(form.tagDraft);
                }}
                placeholder={
                  form.tags.length >= MAX_TAGS
                    ? "Tag limit reached"
                    : "Type a tag, then Enter"
                }
                maxLength={24}
                disabled={form.tags.length >= MAX_TAGS}
              />
              {unusedSuggestions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {unusedSuggestions.map((tag) => (
                    <TagChip
                      key={tag.toLowerCase()}
                      label={tag}
                      onSelect={() => form.addTag(tag)}
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
                value={form.projectId}
                onChange={form.setProjectId}
              />
            </div>

            <div className="grid gap-2">
              <FieldLabel id="card-column-label" required>
                Column
              </FieldLabel>
              <div
                className={cn(
                  "grid grid-cols-2 gap-1.5 rounded-md bg-elevated p-1 shadow-[var(--shadow-border)] sm:grid-cols-4",
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
                  const selected = form.columnId === id;
                  return (
                    <button
                      key={id}
                      id={id === COLUMN_IDS[0] ? "card-column-first" : undefined}
                      type="button"
                      onClick={() => {
                        form.setColumnId(id);
                        form.markTouched("columnId");
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
