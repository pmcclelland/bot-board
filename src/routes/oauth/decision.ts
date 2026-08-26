import { createFileRoute } from "@tanstack/react-router";
import { oauthMethodNotAllowed } from "@/lib/board/mcp-oauth";
import { handleConsentPost } from "@/lib/board/mcp-oauth.server";

export const Route = createFileRoute("/oauth/decision")({
  server: {
    handlers: {
      GET: () => oauthMethodNotAllowed("POST"),
      HEAD: () => oauthMethodNotAllowed("POST"),
      POST: ({ request }) => handleConsentPost(request),
    },
  },
});
