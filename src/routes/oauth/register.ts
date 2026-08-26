import { createFileRoute } from "@tanstack/react-router";
import { handleRegister } from "@/lib/board/mcp-oauth.server";

export const Route = createFileRoute("/oauth/register")({
  server: {
    handlers: {
      GET: ({ request }) => handleRegister(request),
      HEAD: ({ request }) => handleRegister(request),
      POST: ({ request }) => handleRegister(request),
      OPTIONS: ({ request }) => handleRegister(request),
    },
  },
});
