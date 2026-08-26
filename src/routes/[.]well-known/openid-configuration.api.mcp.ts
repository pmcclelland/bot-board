import { createFileRoute } from "@tanstack/react-router";
import { wellKnownHandlers } from "@/lib/board/well-known-route";

export const Route = createFileRoute("/.well-known/openid-configuration/api/mcp")({
  server: { handlers: wellKnownHandlers },
});
