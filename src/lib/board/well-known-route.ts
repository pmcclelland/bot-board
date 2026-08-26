import { handleWellKnown } from "./mcp-oauth";

export const wellKnownHandlers = {
  GET: ({ request }: { request: Request }) => handleWellKnown(request),
  HEAD: ({ request }: { request: Request }) => handleWellKnown(request),
  OPTIONS: ({ request }: { request: Request }) => handleWellKnown(request),
};
