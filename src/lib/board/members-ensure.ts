/** Pure ensureMember write plan — no I/O. Existing approved members stay a read. */

export type MemberEnsureSnapshot = {
  name: string;
  image: string | null;
  role: "admin" | "member";
  status: "pending" | "approved" | "denied";
};

export type ExistingMemberWrite =
  | { apply: false }
  | {
      apply: true;
      name: string;
      image: string | null;
      promote: boolean;
    };

/**
 * Decide whether an existing member row needs a write.
 * Name is filled from the auth profile only when the row is still blank.
 * Image syncs when the profile photo actually changed.
 * Admin-email promotion still runs for genuine role/status changes.
 */
export function planExistingMemberWrite(
  existing: MemberEnsureSnapshot,
  profile: { name: string; image: string | null },
  listedAdmin: boolean,
): ExistingMemberWrite {
  const nextName = existing.name.trim() ? existing.name : profile.name;
  const promote =
    listedAdmin && (existing.status !== "approved" || existing.role !== "admin");
  const profileChanged =
    existing.name !== nextName || existing.image !== profile.image;
  if (!promote && !profileChanged) return { apply: false };
  return { apply: true, name: nextName, image: profile.image, promote };
}
