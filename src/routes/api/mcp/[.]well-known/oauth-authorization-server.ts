import { createFileRoute } from "@tanstack/react-router";
import { wellKnownHandlers } from "@/lib/board/well-known-route";

export const Route = createFileRoute("/api/mcp/.well-known/oauth-authorization-server")({
  server: { handlers: wellKnownHandlers },
});
