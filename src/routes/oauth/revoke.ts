import { createFileRoute } from "@tanstack/react-router";
import { handleRevoke } from "@/lib/board/mcp-oauth.server";

export const Route = createFileRoute("/oauth/revoke")({
  server: {
    handlers: {
      POST: ({ request }) => handleRevoke(request),
      OPTIONS: ({ request }) => handleRevoke(request),
    },
  },
});
