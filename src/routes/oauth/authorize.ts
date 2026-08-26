import { createFileRoute } from "@tanstack/react-router";
import { handleAuthorizeGet } from "@/lib/board/mcp-oauth.server";

export const Route = createFileRoute("/oauth/authorize")({
  server: {
    handlers: {
      GET: ({ request }) => handleAuthorizeGet(request),
    },
  },
});
