import {
  COLUMN_IDS,
  type Card,
  type Columns,
  type Person,
  type Project,
} from "./types";
import type { BoardSnapshot, TaskRow } from "./service";

export function snapshotToState(snapshot: BoardSnapshot): {
  cards: Record<string, Card>;
  columns: Columns;
  projects: Project[];
  people: Person[];
} {
  const cards: Record<string, Card> = {};
  const columns: Columns = { todo: [], doing: [], done: [] };
  for (const columnId of COLUMN_IDS) {
    const ordered = snapshot.tasks
      .filter((task) => task.columnId === columnId)
      .sort((a, b) => a.position - b.position);
    columns[columnId] = ordered.map((task) => {
      cards[task.id] = toCard(task);
      return task.id;
    });
  }
  return {
    cards,
    columns,
    projects: snapshot.projects,
    people: snapshot.people ?? [],
  };
}

function toCard(task: TaskRow): Card {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    url: task.url,
    tags: task.tags,
    projectId: task.projectId,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    createdBy: task.createdBy,
    creator: task.creator,
    assigneeId: task.assigneeId,
    assignee: task.assignee,
  };
}
