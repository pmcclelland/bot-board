import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { planExistingMemberWrite } from "./members-ensure.ts";

const approved: Parameters<typeof planExistingMemberWrite>[0] = {
  name: "Ada",
  image: "https://img.example/ada.png",
  role: "admin",
  status: "approved",
};

describe("planExistingMemberWrite", () => {
  it("does not write when name, image, role, and status are unchanged", () => {
    const plan = planExistingMemberWrite(
      approved,
      { name: "Ada Lovelace", image: "https://img.example/ada.png" },
      false,
    );
    assert.deepEqual(plan, { apply: false });
  });

  it("does not write for an approved member when the admin-email list matches", () => {
    const plan = planExistingMemberWrite(
      approved,
      { name: "Ada", image: "https://img.example/ada.png" },
      true,
    );
    assert.deepEqual(plan, { apply: false });
  });

  it("does not treat a same-value profile as a write", () => {
    const plan = planExistingMemberWrite(
      { ...approved, role: "member" },
      { name: "Ada", image: "https://img.example/ada.png" },
      false,
    );
    assert.deepEqual(plan, { apply: false });
  });

  it("fills a blank name from the profile once", () => {
    const plan = planExistingMemberWrite(
      { ...approved, name: "  " },
      { name: "Ada", image: approved.image },
      false,
    );
    assert.deepEqual(plan, {
      apply: true,
      name: "Ada",
      image: approved.image,
      promote: false,
    });
  });

  it("writes when the profile image changes", () => {
    const plan = planExistingMemberWrite(
      approved,
      { name: "Ada", image: "https://img.example/ada-new.png" },
      false,
    );
    assert.deepEqual(plan, {
      apply: true,
      name: "Ada",
      image: "https://img.example/ada-new.png",
      promote: false,
    });
  });

  it("writes when the profile image is cleared", () => {
    const plan = planExistingMemberWrite(
      approved,
      { name: "Ada", image: null },
      false,
    );
    assert.deepEqual(plan, {
      apply: true,
      name: "Ada",
      image: null,
      promote: false,
    });
  });

  it("promotes a pending listed admin without requiring a profile change", () => {
    const plan = planExistingMemberWrite(
      { ...approved, role: "member", status: "pending" },
      { name: "Ada", image: approved.image },
      true,
    );
    assert.deepEqual(plan, {
      apply: true,
      name: "Ada",
      image: approved.image,
      promote: true,
    });
  });

  it("promotes an approved member who is not yet admin", () => {
    const plan = planExistingMemberWrite(
      { ...approved, role: "member" },
      { name: "Ada", image: approved.image },
      true,
    );
    assert.equal(plan.apply, true);
    if (plan.apply) assert.equal(plan.promote, true);
  });

  it("keeps an existing name even when the profile name differs", () => {
    const plan = planExistingMemberWrite(
      approved,
      { name: "Someone Else", image: approved.image },
      false,
    );
    assert.deepEqual(plan, { apply: false });
  });
});
