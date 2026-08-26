import type { ComponentPropsWithoutRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

type CardSheetProps = {
  open: boolean;
  initial: CardDraft;
  suggestions: string[];
  projects: Project[];
  people: Person[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (draft: CardDraft) => void;
  onCloseAutoFocus?: ComponentPropsWithoutRef<typeof SheetContent>["onCloseAutoFocus"];
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm text-danger" role="alert">
      {message}
    </p>
  );
}

function ignoreDismissFromPopover(event: Event) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (target.closest("[data-radix-popper-content-wrapper]")) {
    event.preventDefault();
  }
}

export function CardSheet({
  open,
  initial,
  suggestions,
  projects,
  people,
  onOpenChange,
  onSubmit,
  onCloseAutoFocus,
}: CardSheetProps) {
  const form = useCardForm({ open, initial, onSubmit, onOpenChange });
  const titleError = form.shownError("title");
  const descriptionError = form.shownError("description");
  const urlError = form.shownError("url");
  const columnError = form.shownError("columnId");
  const unusedSuggestions = suggestions.filter(
    (tag) => !form.tags.some((item) => item.toLowerCase() === tag.toLowerCase()),
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        tabIndex={-1}
        className="gap-0 p-0"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          (event.currentTarget as HTMLElement | null)?.focus();
        }}
        onCloseAutoFocus={onCloseAutoFocus}
        onPointerDownOutside={ignoreDismissFromPopover}
        onInteractOutside={ignoreDismissFromPopover}
      >
        <form
          noValidate
          onSubmit={form.handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Task</SheetTitle>
            <SheetDescription>
              {initial.creator
                ? `Created by ${initial.creator}. Edit the task and save.`
                : "Edit the task and save."}
            </SheetDescription>
          </SheetHeader>

          <div className="dialog-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <textarea
                  id="card-title"
                  value={form.title}
                  onChange={(event) => form.setTitle(event.target.value)}
                  onBlur={() => form.markTouched("title")}
                  placeholder="What needs to happen?"
                  maxLength={120}
                  rows={1}
                  aria-label="Title"
                  aria-required
                  aria-invalid={Boolean(titleError)}
                  aria-describedby={titleError ? "card-title-error" : undefined}
                  className="field-sizing-content w-full resize-none bg-transparent p-0 text-base leading-snug font-semibold text-pretty text-fg outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-fg/25 aria-invalid:ring-2 aria-invalid:ring-danger/70"
                />
                <FieldError id="card-title-error" message={titleError} />
              </div>

              <div className="grid gap-1.5">
                <textarea
                  id="card-description"
                  value={form.description}
                  onChange={(event) => form.setDescription(event.target.value)}
                  onBlur={() => form.markTouched("description")}
                  placeholder="Notes, context, or next steps."
                  maxLength={600}
                  rows={3}
                  aria-label="Description"
                  aria-required
                  aria-invalid={Boolean(descriptionError)}
                  aria-describedby={
                    descriptionError ? "card-description-error" : undefined
                  }
                  className="field-sizing-content min-h-16 w-full resize-none bg-transparent p-0 text-dek font-normal text-pretty text-fg outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-fg/25 aria-invalid:ring-2 aria-invalid:ring-danger/70"
                />
                <FieldError
                  id="card-description-error"
                  message={descriptionError}
                />
              </div>

              <div className="grid gap-3">
                <AssigneeSelect
                  id="card-assignee"
                  tone="plain"
                  people={people}
                  value={form.assigneeId}
                  onChange={form.setAssigneeId}
                />

                <ProjectSelect
                  id="card-project"
                  tone="plain"
                  projects={projects}
                  value={form.projectId}
                  onChange={form.setProjectId}
                />

                <div className="grid gap-1.5">
                  {form.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {form.tags.map((tag) => (
                        <TagChip
                          key={tag.toLowerCase()}
                          label={tag}
                          onRemove={() =>
                            form.setTags(
                              form.tags.filter(
                                (item) =>
                                  item.toLowerCase() !== tag.toLowerCase(),
                              ),
                            )
                          }
                        />
                      ))}
                    </div>
                  ) : null}
                  <input
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
                        : form.tags.length > 0
                          ? "Add a tag"
                          : "Tags"
                    }
                    maxLength={24}
                    disabled={form.tags.length >= MAX_TAGS}
                    aria-label="Tags"
                    className="h-6 w-full bg-transparent p-0 text-dek text-fg outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/70 disabled:opacity-50"
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

                <div className="grid gap-1.5">
                  <input
                    id="card-url"
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    value={form.url}
                    onChange={(event) => form.setUrl(event.target.value)}
                    onBlur={() => form.markTouched("url")}
                    placeholder="Link"
                    spellCheck={false}
                    aria-label="Link"
                    aria-invalid={Boolean(urlError)}
                    aria-describedby={
                      urlError ? "card-url-error" : undefined
                    }
                    className="w-full bg-transparent p-0 text-dek text-fg outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/70 aria-invalid:ring-2 aria-invalid:ring-danger/70"
                  />
                  <FieldError id="card-url-error" message={urlError} />
                </div>

                <div className="grid gap-1.5">
                  <div
                    className={cn(
                      "flex flex-wrap gap-x-3 gap-y-1",
                      columnError && "ring-2 ring-danger/70",
                    )}
                    role="group"
                    aria-label="Lane"
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
                            "min-h-11 text-dek font-medium transition-colors duration-150 ease-out md:min-h-6",
                            selected ? "text-fg" : "text-muted hover:text-fg",
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
            </div>
          </div>

          <div className="flex flex-col gap-2 px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] md:flex-row md:justify-end">
            <Button
              type="button"
              variant="ghost"
              className="w-full md:w-auto"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full md:w-auto">
              Save changes
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
