export type ExistingProject = {
  id: string;
  name: string;
  githubRepoId: string | null;
  archivedAt: string | null;
};

export type RemoteRepo = {
  id: string;
  name: string;
  fullName: string;
  pushedAt: string | null;
};

export type SyncUpsert = {
  existingId?: string;
  githubRepoId: string;
  name: string;
  fullName: string;
  pushedAt: string | null;
};

export type SyncPlan = {
  upserts: SyncUpsert[];
  archives: string[];
  deleteLocal: string[];
};

/**
 * Reconcile the local project table with GitHub repos.
 * Visible projects are GitHub repos only — local/ad-hoc names are removed.
 * Vanished GitHub repos are archived (hidden), not deleted.
 */
export function planGithubProjectSync(
  existing: ExistingProject[],
  remotes: RemoteRepo[],
): SyncPlan {
  const byRepoId = new Map<string, ExistingProject>();
  const deleteLocal: string[] = [];
  for (const project of existing) {
    if (project.githubRepoId) {
      byRepoId.set(project.githubRepoId, project);
    } else {
      deleteLocal.push(project.id);
    }
  }

  const seen = new Set<string>();
  const upserts: SyncUpsert[] = [];
  for (const repo of remotes) {
    seen.add(repo.id);
    const match = byRepoId.get(repo.id);
    upserts.push({
      existingId: match?.id,
      githubRepoId: repo.id,
      name: repo.name,
      fullName: repo.fullName,
      pushedAt: repo.pushedAt,
    });
  }

  const archives: string[] = [];
  for (const project of existing) {
    if (
      project.githubRepoId &&
      !seen.has(project.githubRepoId) &&
      !project.archivedAt
    ) {
      archives.push(project.id);
    }
  }

  return { upserts, archives, deleteLocal };
}

export function visibleGithubProjects<
  T extends { githubRepoId: string | null; archivedAt: string | null },
>(projects: T[]): T[] {
  return projects.filter(
    (project) => Boolean(project.githubRepoId) && !project.archivedAt,
  );
}
