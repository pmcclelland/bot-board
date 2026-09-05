import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import {
  guestCreateTask,
  guestDeleteTask,
  guestMoveTask,
  hydrateGuestBoard,
} from "./guest.ts";
import { SEED_CARDS } from "./seed.ts";
import { useBoardStore } from "./store.ts";

describe("guest board mutations", () => {
  beforeEach(() => {
    hydrateGuestBoard();
  });

  it("creates and deletes only in the in-memory store", () => {
    const before = Object.keys(useBoardStore.getState().cards).length;
    const id = guestCreateTask({
      title: "Try a new card",
      description: "Stays in this tab.",
      url: "",
      tags: ["demo"],
      columnId: "todo",
      projectId: "demo-p-site",
      assigneeId: "",
    });
    assert.equal(Object.keys(useBoardStore.getState().cards).length, before + 1);
    assert.ok(useBoardStore.getState().columns.todo.includes(id));
    assert.equal(SEED_CARDS["demo-c1"]?.title.includes("mutated"), false);

    guestDeleteTask(id);
    assert.equal(useBoardStore.getState().cards[id], undefined);
    assert.equal(Object.keys(useBoardStore.getState().cards).length, before);
  });

  it("moves a seeded card between lanes without touching the module seed", () => {
    const title = SEED_CARDS["demo-c1"].title;
    guestMoveTask("demo-c1", "doing");
    assert.ok(useBoardStore.getState().columns.doing.includes("demo-c1"));
    assert.ok(!useBoardStore.getState().columns.todo.includes("demo-c1"));
    assert.equal(SEED_CARDS["demo-c1"].title, title);
  });
});
