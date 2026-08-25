import { getSql } from "@/lib/db";
import { publicProfileEmail } from "./credentials";
import { parseUrl, uniqueTags } from "./card-fields";
import { validateCardForm } from "./card-form";
import {
  COLUMN_IDS,
  PROJECTS_FROM_GITHUB,
  isColumnId,
  type ColumnId,
  type Person,
  type Project,
} from "./types";
import type { Actor } from "./actor.server";

export type TaskRow = {
  id: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  projectId: string;
  columnId: ColumnId;
  position: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  creator: string;
  assigneeId: string;
  assignee: string;
  assigneeImage: string | null;
  updatedBy: string;
};

export type BoardSnapshot = {
  projects: Project[];
  tasks: TaskRow[];
  people: Person[];
};

export class ServiceError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

function newId(prefix: string) {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${id}`;
}

function asTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      /* ignore */
    }
  }
  return [];
}

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return String(value ?? "");
}

type TaskSql = {
  id: string;
  title: string;
  description: string;
  url: string;
  tags: unknown;
  project_id: string | null;
  column_id: string;
  position: number;
  created_at: string | Date;
  updated_at: string | Date;
  created_by: string;
  updated_by: string;
  assignee_id: string | null;
  creator_name: string | null;
  assignee_name: string | null;
  assignee_image: string | null;
};

function displayName(name: string | null | undefined, email?: string | null) {
  const trimmed = (name ?? "").trim();
  if (trimmed) return trimmed;
  const publicEmail = publicProfileEmail(email ?? "");
  if (publicEmail) return publicEmail;
  return "";
}

function mapTask(row: TaskSql): TaskRow {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    url: row.url,
    tags: asTags(row.tags),
    projectId: row.project_id ?? "",
    columnId: isColumnId(row.column_id) ? row.column_id : "todo",
    position: Number(row.position),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
    createdBy: row.created_by,
    creator: displayName(row.creator_name) || "Unknown",
    assigneeId: row.assignee_id ?? "",
    assignee: displayName(row.assignee_name),
    assigneeImage: row.assignee_image,
    updatedBy: row.updated_by,
  };
}

const TASK_SELECT = `
  select
    t.id, t.title, t.description, t.url, t.tags, t.project_id, t.column_id, t.position,
    t.created_at, t.updated_at, t.created_by, t.updated_by, t.assignee_id,
    c.name as creator_name, a.name as assignee_name, a.image as assignee_image
  from tasks t
  left join members c on c.user_id = t.created_by
  left join members a on a.user_id = t.assignee_id
`;

export async function listPeople(): Promise<Person[]> {
  const sql = await getSql();
  const rows = await sql<{
    user_id: string;
    name: string;
    email: string;
    image: string | null;
  }>`
    select user_id, name, email, image from members
    where status = 'approved'
    order by lower(name), created_at
  `;
  return rows.map((row) => ({
    userId: row.user_id,
    name: displayName(row.name, row.email) || "Unknown",
    image: row.image,
  }));
}

async function resolveAssigneeId(
  value: string | undefined,
): Promise<string | null | undefined> {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const people = await listPeople();
  const byId = people.find((person) => person.userId === trimmed);
  if (byId) return byId.userId;
  const matches = people.filter(
    (person) => person.name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (matches.length === 1) return matches[0].userId;
  if (matches.length > 1) {
    throw new ServiceError(422, "That name matches more than one person.", "invalid_assignee");
  }
  throw new ServiceError(422, "Unknown assignee.", "invalid_assignee");
}

export async function getBoard(): Promise<BoardSnapshot> {
  const sql = await getSql();
  const projects = await listProjects();
  const tasks = await sql.query<TaskSql>(
    `${TASK_SELECT} order by t.column_id, t.position, t.created_at`,
  );
  return {
    projects,
    tasks: tasks.map(mapTask),
    people: await listPeople(),
  };
}

export async function getTask(id: string): Promise<TaskRow> {
  const sql = await getSql();
  const rows = await sql.query<TaskSql>(`${TASK_SELECT} where t.id = $1 limit 1`, [id]);
  const row = rows[0];
  if (!row) throw new ServiceError(404, "Task not found", "not_found");
  return mapTask(row);
}

type TaskInput = {
  title: string;
  description: string;
  url?: string;
  tags?: string[];
  columnId: string;
  projectId?: string;
  assigneeId?: string;
  assignee?: string;
};

async function resolveProjectId(projectId: string | undefined) {
  const trimmed = (projectId ?? "").trim();
  if (!trimmed) return null;
  const sql = await getSql();
  const rows = await sql<{ id: string }>`
    select id from projects
    where id = ${trimmed}
      and github_repo_id is not null
      and archived_at is null
    limit 1
  `;
  if (!rows[0]) throw new ServiceError(422, "Unknown project.", "invalid_project");
  return trimmed;
}

async function nextPosition(columnId: ColumnId) {
  const sql = await getSql();
  const rows = await sql<{ max: number | null }>`
    select max(position) as max from tasks where column_id = ${columnId}
  `;
  return Number(rows[0]?.max ?? -1) + 1;
}

export async function createTask(actor: Actor, input: TaskInput): Promise<TaskRow> {
  const errors = validateCardForm({
    title: input.title,
    description: input.description,
    url: input.url ?? "",
    columnId: input.columnId,
  });
  if (errors.title || errors.description || errors.url || errors.columnId) {
    throw new ServiceError(
      422,
      errors.title ?? errors.description ?? errors.url ?? errors.columnId ?? "Invalid task",
      "invalid",
    );
  }
  const parsed = parseUrl(input.url ?? "");
  if (!parsed.ok) throw new ServiceError(422, "Enter a valid web link, like https://example.com.", "invalid_url");
  const columnId = input.columnId as ColumnId;
  const projectId = await resolveProjectId(input.projectId);
  const assigneeId =
    (await resolveAssigneeId(input.assigneeId ?? input.assignee)) ?? null;
  const id = newId("c");
  const position = await nextPosition(columnId);
  const sql = await getSql();
  const tags = uniqueTags(input.tags ?? []);
  await sql`
    insert into tasks (
      id, title, description, url, tags, project_id, column_id, position,
      created_by, updated_by, assignee_id
    ) values (
      ${id}, ${input.title.trim()}, ${input.description.trim()}, ${parsed.url},
      ${tags}, ${projectId}, ${columnId}, ${position}, ${actor.userId}, ${actor.userId},
      ${assigneeId}
    )
  `;
  return getTask(id);
}

export async function updateTask(
  actor: Actor,
  id: string,
  input: Partial<TaskInput>,
): Promise<TaskRow> {
  const existing = await getTask(id);
  const assigneeId = await resolveAssigneeId(
    input.assigneeId ?? input.assignee,
  );
  const next = {
    title: input.title ?? existing.title,
    description: input.description ?? existing.description,
    url: input.url ?? existing.url,
    tags: input.tags ?? existing.tags,
    columnId: input.columnId ?? existing.columnId,
    projectId: input.projectId ?? existing.projectId,
    assigneeId: assigneeId === undefined ? existing.assigneeId : (assigneeId ?? ""),
  };
  const errors = validateCardForm({
    title: next.title,
    description: next.description,
    url: next.url,
    columnId: next.columnId,
  });
  if (errors.title || errors.description || errors.url || errors.columnId) {
    throw new ServiceError(
      422,
      errors.title ?? errors.description ?? errors.url ?? errors.columnId ?? "Invalid task",
      "invalid",
    );
  }
  const parsed = parseUrl(next.url);
  if (!parsed.ok) throw new ServiceError(422, "Enter a valid web link, like https://example.com.", "invalid_url");
  const projectId = await resolveProjectId(next.projectId);
  const columnId = next.columnId as ColumnId;
  const sql = await getSql();
  await sql`
    update tasks set
      title = ${next.title.trim()},
      description = ${next.description.trim()},
      url = ${parsed.url},
      tags = ${uniqueTags(next.tags)},
      project_id = ${projectId},
      column_id = ${columnId},
      assignee_id = ${next.assigneeId || null},
      updated_at = now(),
      updated_by = ${actor.userId}
    where id = ${id}
  `;
  if (columnId !== existing.columnId) {
    const position = await nextPosition(columnId);
    await sql`update tasks set position = ${position} where id = ${id}`;
  }
  return getTask(id);
}

export async function deleteTask(id: string) {
  const sql = await getSql();
  const rows = await sql<{ id: string }>`delete from tasks where id = ${id} returning id`;
  if (!rows[0]) throw new ServiceError(404, "Task not found", "not_found");
}

export async function moveTask(
  actor: Actor,
  id: string,
  input: { columnId: string; projectId?: string; beforeId?: string | null },
): Promise<TaskRow> {
  if (!isColumnId(input.columnId)) {
    throw new ServiceError(422, "Choose a column.", "invalid");
  }
  const existing = await getTask(id);
  const projectId =
    input.projectId === undefined
      ? existing.projectId || null
      : await resolveProjectId(input.projectId);
  const sql = await getSql();
  const siblings = await sql<{ id: string; position: number }>`
    select id, position from tasks
    where column_id = ${input.columnId} and id <> ${id}
    order by position, created_at
  `;
  const ids = siblings.map((row) => row.id);
  let insertAt = ids.length;
  if (input.beforeId && ids.includes(input.beforeId)) {
    insertAt = ids.indexOf(input.beforeId);
  }
  const ordered = [...ids.slice(0, insertAt), id, ...ids.slice(insertAt)];
  await sql`
    update tasks set
      column_id = ${input.columnId},
      project_id = ${projectId},
      updated_at = now(),
      updated_by = ${actor.userId}
    where id = ${id}
  `;
  for (let index = 0; index < ordered.length; index += 1) {
    await sql`update tasks set position = ${index} where id = ${ordered[index]}`;
  }
  return getTask(id);
}

export async function listProjects(): Promise<Project[]> {
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    name: string;
    github_full_name: string | null;
  }>`
    select id, name, github_full_name from projects
    where github_repo_id is not null and archived_at is null
    order by github_pushed_at desc nulls last, lower(name) asc
  `;
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    githubFullName: row.github_full_name ?? undefined,
  }));
}

export async function createProject(
  _actor: Actor,
  _name: string,
): Promise<Project> {
  throw new ServiceError(422, PROJECTS_FROM_GITHUB, "github_only");
}

export async function renameProject(
  _id: string,
  _name: string,
): Promise<Project> {
  throw new ServiceError(422, PROJECTS_FROM_GITHUB, "github_only");
}

export async function deleteProject(_id: string) {
  throw new ServiceError(422, PROJECTS_FROM_GITHUB, "github_only");
}

export { COLUMN_IDS };
