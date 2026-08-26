import { createFileRoute } from "@tanstack/react-router";
import { handleRevoke } from "@/lib/board/mcp-oauth.server";

export const Route = createFileRoute("/oauth/revoke")({
  server: {
    handlers: {
      GET: ({ request }) => handleRevoke(request),
      HEAD: ({ request }) => handleRevoke(request),
      POST: ({ request }) => handleRevoke(request),
      OPTIONS: ({ request }) => handleRevoke(request),
    },
  },
});
