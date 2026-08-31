import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  GITHUB_SYNC_STALE_MS,
  isGithubSyncStale,
  planGithubProjectSync,
  visibleGithubProjects,
  type ExistingProject,
} from "./sync.ts";

function local(id: string, name: string): ExistingProject {
  return { id, name, githubRepoId: null, archivedAt: null };
}

function github(
  id: string,
  repoId: string,
  name: string,
  archivedAt: string | null = null,
): ExistingProject {
  return { id, name, githubRepoId: repoId, archivedAt };
}

describe("planGithubProjectSync", () => {
  it("upserts new repos and renames when the GitHub name changes", () => {
    const plan = planGithubProjectSync(
      [github("p-1", "11", "old-name")],
      [
        {
          id: "11",
          name: "bot-board",
          fullName: "pmcclelland/bot-board",
          pushedAt: "2026-08-01T00:00:00.000Z",
        },
        {
          id: "22",
          name: "notes",
          fullName: "pmcclelland/notes",
          pushedAt: "2026-08-02T00:00:00.000Z",
        },
      ],
    );

    assert.deepEqual(plan.upserts, [
      {
        existingId: "p-1",
        githubRepoId: "11",
        name: "bot-board",
        fullName: "pmcclelland/bot-board",
        pushedAt: "2026-08-01T00:00:00.000Z",
      },
      {
        existingId: undefined,
        githubRepoId: "22",
        name: "notes",
        fullName: "pmcclelland/notes",
        pushedAt: "2026-08-02T00:00:00.000Z",
      },
    ]);
    assert.deepEqual(plan.archives, []);
    assert.deepEqual(plan.deleteLocal, []);
  });

  it("archives vanished GitHub repos instead of deleting them", () => {
    const plan = planGithubProjectSync(
      [
        github("p-keep", "11", "bot-board"),
        github("p-gone", "99", "legacy"),
      ],
      [
        {
          id: "11",
          name: "bot-board",
          fullName: "pmcclelland/bot-board",
          pushedAt: null,
        },
      ],
    );

    assert.deepEqual(plan.archives, ["p-gone"]);
    assert.equal(plan.upserts.length, 1);
    assert.equal(plan.upserts[0]?.existingId, "p-keep");
  });

  it("does not re-archive a repo that is already hidden", () => {
    const plan = planGithubProjectSync(
      [github("p-gone", "99", "legacy", "2026-08-01T00:00:00.000Z")],
      [],
    );
    assert.deepEqual(plan.archives, []);
  });

  it("removes local and ad-hoc projects such as Today", () => {
    const plan = planGithubProjectSync(
      [
        local("p-today", "Today"),
        local("p-test", "Test Project"),
        github("p-1", "11", "bot-board"),
      ],
      [
        {
          id: "11",
          name: "bot-board",
          fullName: "pmcclelland/bot-board",
          pushedAt: null,
        },
      ],
    );

    assert.deepEqual(plan.deleteLocal.sort(), ["p-test", "p-today"]);
    assert.ok(!plan.upserts.some((item) => item.name === "Today"));
    assert.ok(!plan.archives.includes("p-today"));
  });

  it("does not invent local projects when GitHub returns nothing", () => {
    const plan = planGithubProjectSync(
      [local("p-today", "Today"), local("p-ops", "Ops")],
      [],
    );
    assert.deepEqual(plan.upserts, []);
    assert.deepEqual(plan.deleteLocal.sort(), ["p-ops", "p-today"]);
  });
});

describe("isGithubSyncStale", () => {
  const now = Date.parse("2026-08-31T12:00:00.000Z");

  it("is stale when never synced", () => {
    assert.equal(isGithubSyncStale(null, now), true);
  });

  it("is fresh inside the 5 minute window", () => {
    assert.equal(
      isGithubSyncStale("2026-08-31T11:56:00.000Z", now, GITHUB_SYNC_STALE_MS),
      false,
    );
  });

  it("is stale at the window boundary", () => {
    assert.equal(
      isGithubSyncStale("2026-08-31T11:55:00.000Z", now, GITHUB_SYNC_STALE_MS),
      true,
    );
  });
});

describe("visibleGithubProjects", () => {
  it("hides local projects and archived repos", () => {
    const visible = visibleGithubProjects([
      local("p-today", "Today"),
      github("p-1", "11", "bot-board"),
      github("p-2", "22", "gone", "2026-08-01T00:00:00.000Z"),
    ]);
    assert.deepEqual(
      visible.map((project) => project.id),
      ["p-1"],
    );
  });
});
