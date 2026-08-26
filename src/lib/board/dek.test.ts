import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dekOverflows } from "./dek.ts";

describe("dekOverflows", () => {
  it("is false when text fits the visible box", () => {
    assert.equal(dekOverflows(36, 36), false);
  });

  it("is false for a one-pixel rounding gap", () => {
    assert.equal(dekOverflows(37, 36), false);
  });

  it("is true when a third line is hidden", () => {
    assert.equal(dekOverflows(54, 36), true);
  });

  it("uses the collapsed two-line height while expanded", () => {
    const lineHeight = 18;
    const collapsedHeight = lineHeight * 2;
    assert.equal(dekOverflows(90, collapsedHeight), true);
    assert.equal(dekOverflows(36, collapsedHeight), false);
  });
});
