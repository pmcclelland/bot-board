import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import type { CardDraft } from "./card-draft.ts";
import { parseUrl, uniqueTags } from "./card-fields.ts";
import { firstCardFormError, validateCardForm } from "./card-form.ts";
import type { ColumnId } from "./types.ts";

type FieldKey = "title" | "description" | "url" | "columnId";

type UseCardFormOptions = {
  open: boolean;
  initial: CardDraft;
  onSubmit: (draft: CardDraft) => void;
  onOpenChange: (open: boolean) => void;
};

export function useCardForm({
  open,
  initial,
  onSubmit,
  onOpenChange,
}: UseCardFormOptions) {
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

  const errors = validateCardForm({ title, description, url, columnId });

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
        columnId: "card-column-first",
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

  return {
    title,
    setTitle,
    description,
    setDescription,
    url,
    setUrl,
    tags,
    setTags,
    tagDraft,
    setTagDraft,
    columnId,
    setColumnId,
    projectId,
    setProjectId,
    assigneeId,
    setAssigneeId,
    addTag,
    handleTagKeyDown,
    markTouched,
    shownError,
    handleSubmit,
  };
}
