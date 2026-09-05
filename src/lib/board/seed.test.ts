import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  demoBoardState,
  SEED_CARDS,
  SEED_COLUMNS,
  SEED_PEOPLE,
  SEED_PROJECTS,
} from "./seed.ts";
import { COLUMN_IDS } from "./types.ts";

describe("demoBoardState", () => {
  it("covers backlog, todo, doing, and done", () => {
    const state = demoBoardState();
    for (const columnId of COLUMN_IDS) {
      assert.ok(
        state.columns[columnId].length > 0,
        `expected cards in ${columnId}`,
      );
    }
  });

  it("returns an isolated copy so guest writes cannot mutate the seed", () => {
    const first = demoBoardState();
    const cardId = first.columns.todo[0];
    assert.ok(cardId);
    first.cards[cardId].title = "mutated in session";
    first.columns.todo.push("demo-extra");
    first.projects[0].name = "hijacked";
    first.people[0].name = "Someone else";

    const second = demoBoardState();
    assert.notEqual(second.cards[cardId].title, "mutated in session");
    assert.equal(second.cards[cardId].title, SEED_CARDS[cardId].title);
    assert.deepEqual(second.columns.todo, SEED_COLUMNS.todo);
    assert.equal(second.projects[0].name, SEED_PROJECTS[0].name);
    assert.equal(second.people[0].name, SEED_PEOPLE[0].name);
  });

  it("uses only demo- prefixed ids", () => {
    const state = demoBoardState();
    for (const id of Object.keys(state.cards)) {
      assert.match(id, /^demo-/);
    }
    for (const project of state.projects) {
      assert.match(project.id, /^demo-/);
    }
    for (const person of state.people) {
      assert.match(person.userId, /^demo-/);
    }
  });
});
