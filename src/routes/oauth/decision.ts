import { createFileRoute } from "@tanstack/react-router";
import { handleConsentPost } from "@/lib/board/mcp-oauth.server";

export const Route = createFileRoute("/oauth/decision")({
  server: {
    handlers: {
      POST: ({ request }) => handleConsentPost(request),
    },
  },
});
