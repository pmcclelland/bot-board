import { UnauthorizedError } from "@/lib/auth/verify.server";
import { CORS_HEADERS, corsPreflight, jsonError, requireActor } from "./actor.server";
import { ServiceError } from "./service";
import * as board from "./service";

type Rpc = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

const TOOLS = [
  {
    name: "list_board",
    description: "Get the full shared board: projects and tasks with lane order.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "create_task",
    description:
      "Create a task. Title, description, and columnId (todo|doing|done) are required. url, tags, and projectId are optional.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        columnId: { type: "string", enum: ["todo", "doing", "done"] },
        url: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        projectId: { type: "string" },
      },
      required: ["title", "description", "columnId"],
    },
  },
  {
    name: "get_task",
    description: "Get one task by id.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
  {
    name: "update_task",
    description: "Update a task. Only send fields to change.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        url: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        columnId: { type: "string", enum: ["todo", "doing", "done"] },
        projectId: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_task",
    description: "Delete a task by id.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
  {
    name: "move_task",
    description: "Move a task to a lane and optional project. beforeId inserts it before that task.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        columnId: { type: "string", enum: ["todo", "doing", "done"] },
        projectId: { type: "string" },
        beforeId: { type: "string" },
      },
      required: ["id", "columnId"],
    },
  },
  {
    name: "list_projects",
    description: "List projects on the shared board.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "create_project",
    description: "Create a project, or return the existing one with the same name.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"],
    },
  },
  {
    name: "rename_project",
    description: "Rename a project.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" }, name: { type: "string" } },
      required: ["id", "name"],
    },
  },
  {
    name: "delete_project",
    description: "Delete a project. Its tasks stay on the board without a project.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
];

function rpcJson(body: unknown, status = 200) {
  return Response.json(body, { status, headers: CORS_HEADERS });
}

function rpcResult(id: string | number | null | undefined, result: unknown) {
  return { jsonrpc: "2.0", id: id ?? null, result };
}

function rpcError(
  id: string | number | null | undefined,
  code: number,
  message: string,
) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

function str(value: unknown) {
  return typeof value === "string" ? value : "";
}

async function callTool(name: string, args: Record<string, unknown>, actor: Awaited<ReturnType<typeof requireActor>>) {
  switch (name) {
    case "list_board":
      return board.getBoard();
    case "create_task":
      return board.createTask(actor, {
        title: str(args.title),
        description: str(args.description),
        url: str(args.url),
        tags: Array.isArray(args.tags) ? args.tags.map(String) : [],
        columnId: str(args.columnId) || "todo",
        projectId: str(args.projectId),
      });
    case "get_task":
      return board.getTask(str(args.id));
    case "update_task":
      return board.updateTask(actor, str(args.id), {
        title: typeof args.title === "string" ? args.title : undefined,
        description:
          typeof args.description === "string" ? args.description : undefined,
        url: typeof args.url === "string" ? args.url : undefined,
        tags: Array.isArray(args.tags) ? args.tags.map(String) : undefined,
        columnId: typeof args.columnId === "string" ? args.columnId : undefined,
        projectId: typeof args.projectId === "string" ? args.projectId : undefined,
      });
    case "delete_task":
      await board.deleteTask(str(args.id));
      return { ok: true };
    case "move_task":
      return board.moveTask(actor, str(args.id), {
        columnId: str(args.columnId),
        projectId: typeof args.projectId === "string" ? args.projectId : undefined,
        beforeId: typeof args.beforeId === "string" ? args.beforeId : undefined,
      });
    case "list_projects":
      return board.listProjects();
    case "create_project":
      return board.createProject(actor, str(args.name));
    case "rename_project":
      return board.renameProject(str(args.id), str(args.name));
    case "delete_project":
      await board.deleteProject(str(args.id));
      return { ok: true };
    default:
      throw new ServiceError(404, `Unknown tool: ${name}`, "unknown_tool");
  }
}

export async function handleMcp(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return corsPreflight();
  if (request.method === "GET") {
    return new Response(null, { status: 405, headers: CORS_HEADERS });
  }
  try {
    const actor = await requireActor(request);
    const body = (await request.json()) as Rpc;
    const id = body.id ?? null;
    const method = body.method ?? "";
    const params = body.params ?? {};

    if (method === "initialize") {
      return rpcJson(
        rpcResult(id, {
          protocolVersion: "2025-03-26",
          capabilities: { tools: {} },
          serverInfo: { name: "bot-board", version: "1.0.0" },
        }),
      );
    }
    if (method === "notifications/initialized" || method === "notifications/cancelled") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (method === "tools/list") {
      return rpcJson(rpcResult(id, { tools: TOOLS }));
    }
    if (method === "resources/list") {
      return rpcJson(rpcResult(id, { resources: [] }));
    }
    if (method === "prompts/list") {
      return rpcJson(rpcResult(id, { prompts: [] }));
    }
    if (method === "ping") {
      return rpcJson(rpcResult(id, {}));
    }
    if (method === "tools/call") {
      const name = str(params.name);
      const args =
        params.arguments && typeof params.arguments === "object"
          ? (params.arguments as Record<string, unknown>)
          : {};
      const result = await callTool(name, args, actor);
      return rpcJson(
        rpcResult(id, {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        }),
      );
    }
    return rpcJson(rpcError(id, -32601, `Method not found: ${method}`));
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonError(401, "Unauthorized", "unauthorized");
    }
    if (error instanceof ServiceError) {
      return rpcJson({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32000, message: error.message },
      });
    }
    console.error("[mcp]", error);
    return jsonError(500, "Internal error", "internal");
  }
}
