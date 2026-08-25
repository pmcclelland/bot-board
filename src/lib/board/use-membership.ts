import { useQuery } from "@tanstack/react-query";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { loadMembershipFn } from "./server-fns";

export function useMembership() {
  const { user, isPending } = useCurrentUserState();
  const membership = useQuery({
    queryKey: ["membership"],
    queryFn: () => loadMembershipFn(),
    enabled: Boolean(user),
  });
  return {
    user,
    isPending: isPending || (Boolean(user) && membership.isPending),
    membership: membership.data ?? null,
    isApproved: membership.data?.status === "approved",
    isAdmin: membership.data?.status === "approved" && membership.data.role === "admin",
    isBot: Boolean(membership.data?.isBot),
    error: membership.error,
  };
}
