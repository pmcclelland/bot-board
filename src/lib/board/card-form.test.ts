import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { firstCardFormError, validateCardForm } from "./card-form.ts";

const valid = {
  title: "Draft the note",
  description: "Keep it to one page.",
  url: "",
  columnId: "todo",
};

describe("validateCardForm", () => {
  it("requires title, description, and column", () => {
    assert.deepEqual(
      validateCardForm({
        title: "  ",
        description: "",
        url: "",
        columnId: "",
      }),
      {
        title: "Enter a title.",
        description: "Enter a description.",
        columnId: "Choose a column.",
      },
    );
  });

  it("allows an empty link, tags, and project", () => {
    assert.deepEqual(validateCardForm(valid), {});
  });

  it("rejects a non-http link when one is provided", () => {
    const errors = validateCardForm({
      ...valid,
      url: "javascript:alert(1)",
    });
    assert.equal(
      errors.url,
      "Enter a valid web link, like https://example.com.",
    );
  });

  it("rejects a link that does not match a url pattern", () => {
    const errors = validateCardForm({ ...valid, url: "notaurl" });
    assert.equal(
      errors.url,
      "Enter a valid web link, like https://example.com.",
    );
  });

  it("accepts a bare domain by adding https", () => {
    assert.equal(validateCardForm({ ...valid, url: "example.com" }).url, undefined);
  });
});

describe("firstCardFormError", () => {
  it("returns fields in form order", () => {
    assert.equal(
      firstCardFormError({
        description: "Enter a description.",
        title: "Enter a title.",
      }),
      "title",
    );
    assert.equal(firstCardFormError({}), null);
  });
});
