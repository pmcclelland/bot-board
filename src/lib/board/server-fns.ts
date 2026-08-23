import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

function actor(userId: string) {
  return { userId, email: null };
}

export const loadBoardFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { getBoard } = await import("./service");
    return getBoard();
  });

export const createTaskFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: {
    title: string;
    description: string;
    url?: string;
    tags?: string[];
    columnId: string;
    projectId?: string;
  }) => data)
  .handler(async ({ context, data }) => {
    const { createTask } = await import("./service");
    return createTask(actor(context.userId), data);
  });

export const updateTaskFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: {
    id: string;
    title?: string;
    description?: string;
    url?: string;
    tags?: string[];
    columnId?: string;
    projectId?: string;
  }) => data)
  .handler(async ({ context, data }) => {
    const { updateTask } = await import("./service");
    const { id, ...input } = data;
    return updateTask(actor(context.userId), id, input);
  });

export const deleteTaskFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { deleteTask } = await import("./service");
    await deleteTask(data.id);
    return { ok: true };
  });

export const moveTaskFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: {
    id: string;
    columnId: string;
    projectId?: string;
    beforeId?: string | null;
  }) => data)
  .handler(async ({ context, data }) => {
    const { moveTask } = await import("./service");
    const { id, ...input } = data;
    return moveTask(actor(context.userId), id, input);
  });

export const createProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { name: string }) => data)
  .handler(async ({ context, data }) => {
    const { createProject } = await import("./service");
    return createProject(actor(context.userId), data.name);
  });

export const renameProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string; name: string }) => data)
  .handler(async ({ data }) => {
    const { renameProject } = await import("./service");
    return renameProject(data.id, data.name);
  });

export const deleteProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { deleteProject } = await import("./service");
    await deleteProject(data.id);
    return { ok: true };
  });

export const listTokensFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { listTokens } = await import("./tokens.server");
    return listTokens(context.userId);
  });

export const createTokenFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { name: string }) => data)
  .handler(async ({ context, data }) => {
    const { createToken } = await import("./tokens.server");
    return createToken(context.userId, data.name);
  });

export const revokeTokenFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    const { revokeToken } = await import("./tokens.server");
    await revokeToken(context.userId, data.id);
    return { ok: true };
  });
