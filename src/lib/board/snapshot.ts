import {
  COLUMN_IDS,
  emptyColumns,
  type Card,
  type Columns,
  type Person,
  type Project,
} from "./types";
import type { BoardSnapshot, TaskRow } from "./service";

export function snapshotFingerprint(snapshot: BoardSnapshot): string {
  const tasks = snapshot.tasks
    .map(
      (task) =>
        [
          task.id,
          task.columnId,
          task.position,
          task.updatedAt,
          task.assigneeId,
          task.title,
          task.description,
          task.url,
          task.tags.join(","),
          task.projectId,
        ].join(":"),
    )
    .sort()
    .join("\n");
  const projects = snapshot.projects
    .map((project) => `${project.id}:${project.name}`)
    .join("|");
  const people = (snapshot.people ?? [])
    .map((person) => `${person.userId}:${person.name}:${person.image ?? ""}`)
    .join("|");
  return `${tasks}#${projects}#${people}`;
}

export function snapshotToState(snapshot: BoardSnapshot): {
  cards: Record<string, Card>;
  columns: Columns;
  projects: Project[];
  people: Person[];
} {
  const cards: Record<string, Card> = {};
  const columns: Columns = emptyColumns();
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
    assigneeImage: task.assigneeImage,
  };
}
