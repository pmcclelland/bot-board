import { createFileRoute } from "@tanstack/react-router";
import { wellKnownHandlers } from "@/lib/board/well-known-route";

export const Route = createFileRoute("/api/mcp/.well-known/openid-configuration")({
  server: { handlers: wellKnownHandlers },
});
