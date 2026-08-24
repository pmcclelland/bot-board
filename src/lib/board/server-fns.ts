import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

function actor(userId: string) {
  return { userId, email: null };
}

async function requireBoard(userId: string) {
  const { requireApprovedMember } = await import("./members.server");
  return requireApprovedMember(userId);
}

export const loadMembershipFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { ensureMember } = await import("./members.server");
    return ensureMember(context.userId);
  });

export const listMembersFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { listMembers } = await import("./members.server");
    return listMembers(context.userId);
  });

export const decideMemberFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { userId: string; status: "approved" | "denied" }) => data)
  .handler(async ({ context, data }) => {
    const { decideMember } = await import("./members.server");
    return decideMember(context.userId, data.userId, data.status);
  });

export const setMemberRoleFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { userId: string; role: "admin" | "member" }) => data)
  .handler(async ({ context, data }) => {
    const { setMemberRole } = await import("./members.server");
    return setMemberRole(context.userId, data.userId, data.role);
  });

export const updateMemberProfileFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: {
    userId: string;
    name: string;
    email: string;
    description: string;
  }) => data)
  .handler(async ({ context, data }) => {
    const { updateMemberProfile } = await import("./members.server");
    return updateMemberProfile(context.userId, data.userId, {
      name: data.name,
      email: data.email,
      description: data.description,
    });
  });

export const loadBoardFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireBoard(context.userId);
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
    assigneeId?: string;
  }) => data)
  .handler(async ({ context, data }) => {
    await requireBoard(context.userId);
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
    assigneeId?: string;
  }) => data)
  .handler(async ({ context, data }) => {
    await requireBoard(context.userId);
    const { updateTask } = await import("./service");
    const { id, ...input } = data;
    return updateTask(actor(context.userId), id, input);
  });

export const deleteTaskFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    await requireBoard(context.userId);
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
    await requireBoard(context.userId);
    const { moveTask } = await import("./service");
    const { id, ...input } = data;
    return moveTask(actor(context.userId), id, input);
  });

export const createProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { name: string }) => data)
  .handler(async ({ context, data }) => {
    await requireBoard(context.userId);
    const { createProject } = await import("./service");
    return createProject(actor(context.userId), data.name);
  });

export const renameProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string; name: string }) => data)
  .handler(async ({ context, data }) => {
    await requireBoard(context.userId);
    const { renameProject } = await import("./service");
    return renameProject(data.id, data.name);
  });

export const deleteProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    await requireBoard(context.userId);
    const { deleteProject } = await import("./service");
    await deleteProject(data.id);
    return { ok: true };
  });

export const listTokensFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireBoard(context.userId);
    const { listTokens } = await import("./tokens.server");
    return listTokens(context.userId);
  });

export const createTokenFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { name: string }) => data)
  .handler(async ({ context, data }) => {
    await requireBoard(context.userId);
    const { createToken } = await import("./tokens.server");
    return createToken(context.userId, data.name);
  });

export const revokeTokenFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    await requireBoard(context.userId);
    const { revokeToken } = await import("./tokens.server");
    await revokeToken(context.userId, data.id);
    return { ok: true };
  });
