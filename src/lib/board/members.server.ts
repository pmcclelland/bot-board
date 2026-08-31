import { getSql } from "@/lib/db";
import {
  isInternalEmail,
  isProfileEmail,
  publicProfileEmail,
} from "./credentials";
import { planExistingMemberWrite } from "./members-ensure";
import { ServiceError } from "./service";

export type MemberRole = "admin" | "member";
export type MemberStatus = "pending" | "approved" | "denied";

export type Member = {
  userId: string;
  email: string;
  name: string;
  description: string;
  image: string | null;
  role: MemberRole;
  status: MemberStatus;
  createdAt: string;
  decidedAt: string | null;
};

export type MemberProfileInput = {
  name: string;
  email: string;
  description: string;
};

const MAX_NAME = 80;
const MAX_DESCRIPTION = 400;

function adminEmails() {
  return (process.env.BOARD_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function isRole(value: string): value is MemberRole {
  return value === "admin" || value === "member";
}

function isStatus(value: string): value is MemberStatus {
  return value === "pending" || value === "approved" || value === "denied";
}

type MemberSql = {
  user_id: string;
  email: string;
  name: string;
  description: string;
  image: string | null;
  role: string;
  status: string;
  created_at: string | Date;
  decided_at: string | Date | null;
};

function mapMember(row: MemberSql): Member {
  return {
    userId: row.user_id,
    email: publicProfileEmail(row.email),
    name: row.name,
    description: row.description ?? "",
    image: row.image,
    role: isRole(row.role) ? row.role : "member",
    status: isStatus(row.status) ? row.status : "pending",
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
    decidedAt:
      row.decided_at instanceof Date
        ? row.decided_at.toISOString()
        : row.decided_at,
  };
}

function normalizeName(value: string) {
  const name = value.trim();
  if (name.length > MAX_NAME) {
    throw new ServiceError(422, `Name must be ${MAX_NAME} characters or fewer.`, "invalid");
  }
  return name;
}

function normalizeDescription(value: string) {
  const description = value.trim();
  if (description.length > MAX_DESCRIPTION) {
    throw new ServiceError(
      422,
      `Description must be ${MAX_DESCRIPTION} characters or fewer.`,
      "invalid",
    );
  }
  return description;
}

function normalizeProfileEmail(value: string) {
  const email = value.trim();
  if (!email) return "";
  if (isInternalEmail(email)) {
    throw new ServiceError(422, "Leave email blank — no address is required.", "invalid");
  }
  if (!isProfileEmail(email)) {
    throw new ServiceError(422, "Enter a valid email, or leave it blank.", "invalid");
  }
  return email.toLowerCase();
}

async function profile(userId: string) {
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    name: string;
    email: string;
    image: string | null;
  }>`select id, name, email, image from "user" where id = ${userId} limit 1`;
  const row = rows[0];
  return {
    email: row?.email ?? "",
    name: row?.name ?? "",
    image: row?.image ?? null,
  };
}

async function getMember(userId: string): Promise<Member | null> {
  const sql = await getSql();
  const rows = await sql<MemberSql>`
    select user_id, email, name, description, image, role, status, created_at, decided_at
    from members where user_id = ${userId} limit 1
  `;
  return rows[0] ? mapMember(rows[0]) : null;
}

async function approvedAdminCount() {
  const sql = await getSql();
  const rows = await sql<{ count: number }>`
    select count(*)::int as count from members
    where status = 'approved' and role = 'admin'
  `;
  return Number(rows[0]?.count ?? 0);
}

export async function ensureMember(userId: string): Promise<Member> {
  const info = await profile(userId);
  const existing = await getMember(userId);
  const listedAdmin = adminEmails().includes(info.email.trim().toLowerCase());

  if (existing) {
    const plan = planExistingMemberWrite(existing, info, listedAdmin);
    if (!plan.apply) return existing;

    const sql = await getSql();
    const rows = plan.promote
      ? await sql<MemberSql>`
          update members set
            name = ${plan.name},
            image = ${plan.image},
            role = 'admin',
            status = 'approved',
            decided_at = now(),
            decided_by = ${userId}
          where user_id = ${userId}
          returning user_id, email, name, description, image, role, status, created_at, decided_at
        `
      : await sql<MemberSql>`
          update members set
            name = ${plan.name},
            image = ${plan.image}
          where user_id = ${userId}
          returning user_id, email, name, description, image, role, status, created_at, decided_at
        `;
    return rows[0] ? mapMember(rows[0]) : { ...existing, name: plan.name, image: plan.image };
  }

  const bootstrapAdmin = listedAdmin || (await approvedAdminCount()) === 0;
  const role: MemberRole = bootstrapAdmin ? "admin" : "member";
  const status: MemberStatus = bootstrapAdmin ? "approved" : "pending";
  const sql = await getSql();
  const profileEmail = publicProfileEmail(info.email);
  const created = await sql<MemberSql>`
    insert into members (user_id, email, name, description, image, role, status, decided_at, decided_by)
    values (
      ${userId}, ${profileEmail}, ${info.name}, ${""}, ${info.image}, ${role}, ${status},
      ${bootstrapAdmin ? new Date().toISOString() : null},
      ${bootstrapAdmin ? userId : null}
    )
    returning user_id, email, name, description, image, role, status, created_at, decided_at
  `;
  if (!created[0]) throw new ServiceError(500, "Could not create membership", "internal");
  return mapMember(created[0]);
}

export function assertApproved(member: Member) {
  if (member.status === "approved") return;
  if (member.status === "denied") {
    throw new ServiceError(403, "Access denied.", "denied");
  }
  throw new ServiceError(403, "Waiting for approval.", "pending");
}

export async function requireApprovedMember(userId: string): Promise<Member> {
  const member = await ensureMember(userId);
  assertApproved(member);
  return member;
}

export async function isBotUser(userId: string) {
  const info = await profile(userId);
  return isInternalEmail(info.email);
}

export async function requireApprovedHuman(userId: string): Promise<Member> {
  const member = await requireApprovedMember(userId);
  if (await isBotUser(userId)) {
    throw new ServiceError(
      403,
      "Bots cannot connect GitHub.",
      "bots_cannot_connect",
    );
  }
  return member;
}

export async function requireAdmin(userId: string): Promise<Member> {
  const member = await requireApprovedMember(userId);
  if (member.role !== "admin") {
    throw new ServiceError(403, "Admin only.", "forbidden");
  }
  return member;
}

export async function listMembers(adminId: string): Promise<Member[]> {
  await requireAdmin(adminId);
  const sql = await getSql();
  const rows = await sql<MemberSql>`
    select user_id, email, name, description, image, role, status, created_at, decided_at
    from members
    order by
      case status when 'pending' then 0 when 'approved' then 1 else 2 end,
      created_at asc
  `;
  return rows.map(mapMember);
}

export async function decideMember(
  adminId: string,
  userId: string,
  status: MemberStatus,
): Promise<Member> {
  const admin = await requireAdmin(adminId);
  if (userId === admin.userId && status !== "approved") {
    throw new ServiceError(422, "You cannot change your own access.", "invalid");
  }
  const target = await getMember(userId);
  if (!target) throw new ServiceError(404, "Member not found", "not_found");
  if (target.role === "admin" && target.status === "approved" && status !== "approved") {
    if ((await approvedAdminCount()) <= 1) {
      throw new ServiceError(422, "Keep at least one admin.", "invalid");
    }
  }
  const sql = await getSql();
  const rows = await sql<MemberSql>`
    update members set
      status = ${status},
      decided_at = now(),
      decided_by = ${adminId}
    where user_id = ${userId}
    returning user_id, email, name, description, image, role, status, created_at, decided_at
  `;
  if (!rows[0]) throw new ServiceError(404, "Member not found", "not_found");
  return mapMember(rows[0]);
}

export async function setMemberRole(
  adminId: string,
  userId: string,
  role: MemberRole,
): Promise<Member> {
  const admin = await requireAdmin(adminId);
  if (userId === admin.userId && role !== "admin") {
    throw new ServiceError(422, "You cannot change your own role.", "invalid");
  }
  const target = await getMember(userId);
  if (!target) throw new ServiceError(404, "Member not found", "not_found");
  if (target.status !== "approved") {
    throw new ServiceError(422, "Approve this person first.", "invalid");
  }
  if (target.role === "admin" && role !== "admin" && (await approvedAdminCount()) <= 1) {
    throw new ServiceError(422, "Keep at least one admin.", "invalid");
  }
  const sql = await getSql();
  const rows = await sql<MemberSql>`
    update members set role = ${role} where user_id = ${userId}
    returning user_id, email, name, description, image, role, status, created_at, decided_at
  `;
  if (!rows[0]) throw new ServiceError(404, "Member not found", "not_found");
  return mapMember(rows[0]);
}

export async function updateMemberProfile(
  adminId: string,
  userId: string,
  input: MemberProfileInput,
): Promise<Member> {
  await requireAdmin(adminId);
  const target = await getMember(userId);
  if (!target) throw new ServiceError(404, "Member not found", "not_found");
  const name = normalizeName(input.name);
  const email = normalizeProfileEmail(input.email);
  const description = normalizeDescription(input.description);
  const sql = await getSql();
  const rows = await sql<MemberSql>`
    update members set
      name = ${name},
      email = ${email},
      description = ${description}
    where user_id = ${userId}
    returning user_id, email, name, description, image, role, status, created_at, decided_at
  `;
  if (!rows[0]) throw new ServiceError(404, "Member not found", "not_found");
  return mapMember(rows[0]);
}
