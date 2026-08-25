import { createFileRoute } from "@tanstack/react-router";
import { handleGithubCallback } from "@/lib/github/oauth.server";

export const Route = createFileRoute("/api/github/callback")({
  server: {
    handlers: {
      GET: ({ request }) => handleGithubCallback(request),
    },
  },
});
