import type { Card, Columns, Person, Project } from "./types.ts";

const now = Date.now();
const iso = (daysAgo: number, hours = 0) =>
  new Date(now - daysAgo * 86_400_000 - hours * 3_600_000).toISOString();

export const SEED_PROJECTS: Project[] = [
  { id: "demo-p-handbook", name: "handbook", githubFullName: "acme/handbook" },
  { id: "demo-p-site", name: "site", githubFullName: "acme/site" },
  { id: "demo-p-routines", name: "routines", githubFullName: "acme/routines" },
];

export const SEED_PEOPLE: Person[] = [
  { userId: "demo-sam", name: "Sam Chen", image: null },
  { userId: "demo-atlas", name: "Atlas", image: null },
  { userId: "demo-forge", name: "Forge", image: null },
];

function person(userId: string) {
  const match = SEED_PEOPLE.find((item) => item.userId === userId);
  return {
    createdBy: userId,
    creator: match?.name ?? "",
    assigneeId: userId,
    assignee: match?.name ?? "",
    assigneeImage: match?.image ?? null,
  };
}

function filedBy(userId: string, assigneeId = "") {
  const creator = SEED_PEOPLE.find((item) => item.userId === userId);
  const assignee = SEED_PEOPLE.find((item) => item.userId === assigneeId);
  return {
    createdBy: userId,
    creator: creator?.name ?? "",
    assigneeId,
    assignee: assignee?.name ?? "",
    assigneeImage: assignee?.image ?? null,
  };
}

export const SEED_CARDS: Record<string, Card> = {
  "demo-c1": {
    id: "demo-c1",
    title: "Draft Friday’s bot status note",
    description:
      "Pull wins, blockers, and next steps from this week’s lanes. Keep it to one page.",
    url: "",
    tags: ["writing", "weekly"],
    projectId: "demo-p-handbook",
    createdAt: iso(4),
    updatedAt: iso(2, 3),
    ...filedBy("demo-sam", "demo-atlas"),
  },
  "demo-c2": {
    id: "demo-c2",
    title: "Sketch the onboarding walkthrough",
    description:
      "Four screens, one idea each. Lead with the outcome, not the controls.",
    url: "https://www.figma.com",
    tags: ["design"],
    projectId: "demo-p-site",
    createdAt: iso(5),
    updatedAt: iso(1, 6),
    ...filedBy("demo-sam"),
  },
  "demo-c3": {
    id: "demo-c3",
    title: "Park the changelog digest",
    description:
      "Collect shipped notes from Done. Atlas can turn them into the Friday post later.",
    url: "",
    tags: ["writing"],
    projectId: "demo-p-handbook",
    createdAt: iso(2),
    updatedAt: iso(2),
    ...filedBy("demo-sam", "demo-atlas"),
  },
  "demo-c4": {
    id: "demo-c4",
    title: "Tighten the launch copy",
    description:
      "Cut the intro to four lines. Every sentence should earn its place.",
    url: "https://linear.app",
    tags: ["writing", "launch"],
    projectId: "demo-p-site",
    createdAt: iso(6),
    updatedAt: iso(0, 2),
    ...person("demo-sam"),
  },
  "demo-c5": {
    id: "demo-c5",
    title: "Review open pull requests",
    description: "Leave notes on naming and missing empty states before standup.",
    url: "https://github.com",
    tags: ["engineering"],
    projectId: "demo-p-routines",
    createdAt: iso(1),
    updatedAt: iso(0, 5),
    ...person("demo-forge"),
  },
  "demo-c6": {
    id: "demo-c6",
    title: "Choose type and color",
    description: "Serif for the mark, sans for the board. Stone on ink, no extras.",
    url: "",
    tags: ["design"],
    projectId: "demo-p-site",
    createdAt: iso(8),
    updatedAt: iso(3),
    ...filedBy("demo-sam"),
  },
  "demo-c7": {
    id: "demo-c7",
    title: "Wire the MCP list_board tool",
    description: "Bots should read the same lanes humans see. No second board.",
    url: "https://github.com",
    tags: ["engineering", "mcp"],
    projectId: "demo-p-routines",
    createdAt: iso(7),
    updatedAt: iso(3, 4),
    ...filedBy("demo-forge", "demo-atlas"),
  },
  "demo-c8": {
    id: "demo-c8",
    title: "Mint a token for Atlas",
    description: "From Settings, after Sam signs in. Not on this sample board.",
    url: "",
    tags: ["ops"],
    projectId: "demo-p-routines",
    createdAt: iso(3),
    updatedAt: iso(3),
    ...filedBy("demo-sam"),
  },
};

export const SEED_COLUMNS: Columns = {
  backlog: ["demo-c3", "demo-c8"],
  todo: ["demo-c2", "demo-c1"],
  doing: ["demo-c5", "demo-c4"],
  done: ["demo-c6", "demo-c7"],
};

function clone<T>(value: T): T {
  return structuredClone(value);
}

/** Isolated copy for guest sessions. Mutations must not touch the module seed. */
export function demoBoardState() {
  return {
    cards: clone(SEED_CARDS),
    columns: clone(SEED_COLUMNS),
    projects: clone(SEED_PROJECTS),
    people: clone(SEED_PEOPLE),
  };
}
