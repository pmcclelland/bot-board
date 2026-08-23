import type { Card, Columns, Project } from "./types";

const now = Date.now();
const iso = (daysAgo: number, hours = 0) =>
  new Date(now - daysAgo * 86_400_000 - hours * 3_600_000).toISOString();

export const SEED_PROJECTS: Project[] = [
  { id: "p-cairn", name: "Ops" },
  { id: "p-launch", name: "Launch" },
  { id: "p-personal", name: "Personal" },
];

export const SEED_CARDS: Record<string, Card> = {
  c1: {
    id: "c1",
    title: "Draft the Friday status note",
    description:
      "Pull wins, blockers, and next steps from this week’s lane. Keep it to one page.",
    url: "",
    tags: ["writing", "weekly"],
    projectId: "p-launch",
    createdAt: iso(4),
    updatedAt: iso(2, 3),
  },
  c2: {
    id: "c2",
    title: "Sketch the onboarding walkthrough",
    description:
      "Four screens, one idea each. Lead with the outcome, not the controls.",
    url: "https://www.figma.com",
    tags: ["design"],
    projectId: "p-cairn",
    createdAt: iso(5),
    updatedAt: iso(1, 6),
  },
  c3: {
    id: "c3",
    title: "Book the Saturday trail slot",
    description: "Check weather by Thursday. If it storms, shift to the river loop.",
    url: "",
    tags: ["personal"],
    projectId: "p-personal",
    createdAt: iso(2),
    updatedAt: iso(2),
  },
  c4: {
    id: "c4",
    title: "Tighten the launch copy",
    description:
      "Cut the intro to four lines. Every sentence should earn its place.",
    url: "https://linear.app",
    tags: ["writing", "launch"],
    projectId: "p-launch",
    createdAt: iso(6),
    updatedAt: iso(0, 2),
  },
  c5: {
    id: "c5",
    title: "Review open pull requests",
    description: "Leave notes on naming and missing empty states before standup.",
    url: "https://github.com",
    tags: ["engineering"],
    projectId: "p-cairn",
    createdAt: iso(1),
    updatedAt: iso(0, 5),
  },
  c6: {
    id: "c6",
    title: "Choose type and color",
    description: "Serif for the mark, sans for the board. Stone on ink, no extras.",
    url: "",
    tags: ["design"],
    projectId: "p-cairn",
    createdAt: iso(8),
    updatedAt: iso(3),
  },
  c7: {
    id: "c7",
    title: "Persist board state",
    description: "Cards, order, and columns should survive a refresh.",
    url: "https://github.com",
    tags: ["engineering"],
    projectId: "p-cairn",
    createdAt: iso(7),
    updatedAt: iso(3, 4),
  },
};

export const SEED_COLUMNS: Columns = {
  todo: ["c2", "c1", "c3"],
  doing: ["c5", "c4"],
  done: ["c6", "c7"],
};
