import { parseUrl } from "./card-fields.ts";
import { isColumnId } from "./types.ts";

export type CardFormValues = {
  title: string;
  description: string;
  url: string;
  columnId: string;
};

export type CardFormErrors = {
  title?: string;
  description?: string;
  url?: string;
  columnId?: string;
};

export function validateCardForm(values: CardFormValues): CardFormErrors {
  const errors: CardFormErrors = {};

  if (!values.title.trim()) {
    errors.title = "Enter a title.";
  }

  if (!values.description.trim()) {
    errors.description = "Enter a description.";
  }

  const parsed = parseUrl(values.url);
  if (!parsed.ok) {
    errors.url = "Enter a valid web link, like https://example.com.";
  }

  if (!isColumnId(values.columnId)) {
    errors.columnId = "Choose a column.";
  }

  return errors;
}

export function firstCardFormError(
  errors: CardFormErrors,
): keyof CardFormErrors | null {
  if (errors.title) return "title";
  if (errors.description) return "description";
  if (errors.url) return "url";
  if (errors.columnId) return "columnId";
  return null;
}
