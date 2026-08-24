export const COLUMN_IDS = ["todo", "doing", "done"] as const;

export type ColumnId = (typeof COLUMN_IDS)[number];

export type Project = {
  id: string;
  name: string;
};

export type Person = {
  userId: string;
  name: string;
  image: string | null;
};

export type Card = {
  id: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  projectId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  creator: string;
  assigneeId: string;
  assignee: string;
  assigneeImage: string | null;
};

export type CardInput = {
  title: string;
  description: string;
  url: string;
  tags: string[];
  columnId: ColumnId;
  projectId: string;
  assigneeId: string;
};

export type Columns = Record<ColumnId, string[]>;

export const COLUMN_META: Record<
  ColumnId,
  { label: string; hint: string; tone: string }
> = {
  todo: {
    label: "To Do",
    hint: "Ready to start",
    tone: "bg-todo",
  },
  doing: {
    label: "Doing",
    hint: "In motion",
    tone: "bg-doing",
  },
  done: {
    label: "Done",
    hint: "Shipped",
    tone: "bg-done",
  },
};

export const MAX_TAGS = 8;
export const MAX_TAG_LENGTH = 24;
export const MAX_PROJECT_NAME = 32;

export function isColumnId(value: string): value is ColumnId {
  return (COLUMN_IDS as readonly string[]).includes(value);
}

export function dockId(columnId: ColumnId) {
  return `dock-${columnId}`;
}

export function columnFromDroppable(id: string): ColumnId | null {
  if (isColumnId(id)) return id;
  if (id.startsWith("dock-")) {
    const columnId = id.slice(5);
    if (isColumnId(columnId)) return columnId;
  }
  return null;
}
