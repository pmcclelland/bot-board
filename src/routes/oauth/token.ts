import { createFileRoute } from "@tanstack/react-router";
import { handleToken } from "@/lib/board/mcp-oauth.server";

export const Route = createFileRoute("/oauth/token")({
  server: {
    handlers: {
      POST: ({ request }) => handleToken(request),
      OPTIONS: ({ request }) => handleToken(request),
    },
  },
});
