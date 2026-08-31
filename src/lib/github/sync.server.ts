import { getSql } from "@/lib/db";
import { GithubAuthError, listOwnedRepos } from "./api";
import {
  getWorkspaceConnection,
  getWorkspaceConnectionSyncMeta,
  markConnectionBroken,
  markConnectionSynced,
  resolveAccessToken,
} from "./connection.server";
import {
  GITHUB_SYNC_STALE_MS,
  isGithubSyncStale,
  planGithubProjectSync,
  type ExistingProject,
} from "./sync";

function newProjectId() {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `p-${id}`;
}

export async function syncGithubProjects(options?: {
  force?: boolean;
  maxAgeMs?: number;
}): Promise<{ synced: boolean }> {
  const meta = await getWorkspaceConnectionSyncMeta();
  if (!meta) return { synced: false };

  const maxAge = options?.maxAgeMs ?? GITHUB_SYNC_STALE_MS;
  if (!options?.force && !isGithubSyncStale(meta.lastSyncedAt, Date.now(), maxAge)) {
    return { synced: false };
  }

  const connection = await getWorkspaceConnection();
  if (!connection) return { synced: false };

  try {
    const accessToken = await resolveAccessToken(connection);
    const repos = await listOwnedRepos(accessToken);
    const sql = await getSql();
    const existing = await sql<{
      id: string;
      name: string;
      github_repo_id: string | null;
      archived_at: string | Date | null;
    }>`
      select id, name, github_repo_id, archived_at from projects
    `;
    const current: ExistingProject[] = existing.map((row) => ({
      id: row.id,
      name: row.name,
      githubRepoId: row.github_repo_id,
      archivedAt: row.archived_at
        ? row.archived_at instanceof Date
          ? row.archived_at.toISOString()
          : String(row.archived_at)
        : null,
    }));
    const plan = planGithubProjectSync(
      current,
      repos.map((repo) => ({
        id: String(repo.id),
        name: repo.name,
        fullName: repo.full_name,
        pushedAt: repo.pushed_at ?? repo.updated_at,
      })),
    );

    for (const upsert of plan.upserts) {
      const pushedAt = upsert.pushedAt;
      if (upsert.existingId) {
        await sql`
          update projects set
            name = ${upsert.name},
            github_full_name = ${upsert.fullName},
            github_pushed_at = ${pushedAt},
            archived_at = null
          where id = ${upsert.existingId}
        `;
      } else {
        const id = newProjectId();
        await sql`
          insert into projects (
            id, name, created_by, github_repo_id, github_full_name, github_pushed_at
          ) values (
            ${id}, ${upsert.name}, ${connection.connectedBy},
            ${upsert.githubRepoId}, ${upsert.fullName}, ${pushedAt}
          )
        `;
      }
    }

    for (const id of plan.archives) {
      await sql`update projects set archived_at = now() where id = ${id}`;
    }

    for (const id of plan.deleteLocal) {
      await sql`delete from projects where id = ${id}`;
    }

    await markConnectionSynced();
    return { synced: true };
  } catch (error) {
    if (error instanceof GithubAuthError) {
      await markConnectionBroken();
      return { synced: false };
    }
    console.error("[github-sync] failed");
    return { synced: false };
  }
}

export async function archiveAllGithubProjects() {
  const sql = await getSql();
  await sql`
    update projects
    set archived_at = now()
    where github_repo_id is not null and archived_at is null
  `;
}
