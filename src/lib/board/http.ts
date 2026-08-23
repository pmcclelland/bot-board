import { UnauthorizedError } from "@/lib/auth/verify.server";
import { corsPreflight, jsonError, jsonOk, requireActor } from "./actor.server";
import { ServiceError } from "./service";
import * as board from "./service";
import * as tokens from "./tokens.server";

async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    if (body && typeof body === "object") return body as Record<string, unknown>;
  } catch {
    /* empty */
  }
  return {};
}

function str(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function handleV1(request: Request): Promise<Response> {
  if (request.method.toUpperCase() === "OPTIONS") return corsPreflight();
  try {
    const actor = await requireActor(request);
    const { requireApprovedMember } = await import("./members.server");
    await requireApprovedMember(actor.userId);
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api\/v1\/?/, "").replace(/\/$/, "");
    const parts = path ? path.split("/") : [];
    const method = request.method.toUpperCase();

    if (parts.length === 1 && parts[0] === "board" && method === "GET") {
      return jsonOk(await board.getBoard());
    }

    if (parts.length === 1 && parts[0] === "tasks" && method === "POST") {
      const body = await readJson(request);
      const tags = Array.isArray(body.tags) ? body.tags.map(String) : [];
      return jsonOk(
        await board.createTask(actor, {
          title: str(body.title),
          description: str(body.description),
          url: str(body.url),
          tags,
          columnId: str(body.columnId) || "todo",
          projectId: str(body.projectId),
        }),
        201,
      );
    }

    if (parts.length === 2 && parts[0] === "tasks" && method === "GET") {
      return jsonOk(await board.getTask(parts[1]));
    }

    if (parts.length === 2 && parts[0] === "tasks" && method === "PATCH") {
      const body = await readJson(request);
      return jsonOk(
        await board.updateTask(actor, parts[1], {
          title: typeof body.title === "string" ? body.title : undefined,
          description:
            typeof body.description === "string" ? body.description : undefined,
          url: typeof body.url === "string" ? body.url : undefined,
          tags: Array.isArray(body.tags) ? body.tags.map(String) : undefined,
          columnId: typeof body.columnId === "string" ? body.columnId : undefined,
          projectId:
            typeof body.projectId === "string" ? body.projectId : undefined,
        }),
      );
    }

    if (parts.length === 2 && parts[0] === "tasks" && method === "DELETE") {
      await board.deleteTask(parts[1]);
      return jsonOk({ ok: true });
    }

    if (
      parts.length === 3 &&
      parts[0] === "tasks" &&
      parts[2] === "move" &&
      method === "POST"
    ) {
      const body = await readJson(request);
      return jsonOk(
        await board.moveTask(actor, parts[1], {
          columnId: str(body.columnId),
          projectId:
            typeof body.projectId === "string" ? body.projectId : undefined,
          beforeId:
            body.beforeId === null
              ? null
              : typeof body.beforeId === "string"
                ? body.beforeId
                : undefined,
        }),
      );
    }

    if (parts.length === 1 && parts[0] === "projects" && method === "GET") {
      return jsonOk(await board.listProjects());
    }

    if (parts.length === 1 && parts[0] === "projects" && method === "POST") {
      const body = await readJson(request);
      return jsonOk(await board.createProject(actor, str(body.name)), 201);
    }

    if (parts.length === 2 && parts[0] === "projects" && method === "PATCH") {
      const body = await readJson(request);
      return jsonOk(await board.renameProject(parts[1], str(body.name)));
    }

    if (parts.length === 2 && parts[0] === "projects" && method === "DELETE") {
      await board.deleteProject(parts[1]);
      return jsonOk({ ok: true });
    }

    if (parts.length === 1 && parts[0] === "tokens" && method === "GET") {
      return jsonOk(await tokens.listTokens(actor.userId));
    }

    if (parts.length === 1 && parts[0] === "tokens" && method === "POST") {
      const body = await readJson(request);
      return jsonOk(await tokens.createToken(actor.userId, str(body.name)), 201);
    }

    if (parts.length === 2 && parts[0] === "tokens" && method === "DELETE") {
      await tokens.revokeToken(actor.userId, parts[1]);
      return jsonOk({ ok: true });
    }

    return jsonError(404, "Not found", "not_found");
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonError(401, "Unauthorized", "unauthorized");
    }
    if (error instanceof ServiceError) {
      return jsonError(error.status, error.message, error.code);
    }
    console.error("[api/v1]", error);
    return jsonError(500, "Internal error", "internal");
  }
}
