import { createFileRoute } from "@tanstack/react-router";
import { handleGithubConnect } from "@/lib/github/oauth.server";

export const Route = createFileRoute("/api/github/connect")({
  server: {
    handlers: {
      GET: ({ request }) => handleGithubConnect(request),
    },
  },
});
