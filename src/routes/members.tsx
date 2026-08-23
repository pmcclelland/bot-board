import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AccountBar } from "@/components/kanban/account-bar";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import {
  decideMemberFn,
  listMembersFn,
  setMemberRoleFn,
} from "@/lib/board/server-fns";
import { useMembership } from "@/lib/board/use-membership";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/members")({ component: Members });

function Members() {
  const { user, isPending, isAdmin, isApproved } = useMembership();
  const queryClient = useQueryClient();
  const members = useQuery({
    queryKey: ["members"],
    queryFn: () => listMembersFn(),
    enabled: isAdmin,
  });

  const decide = useMutation({
    mutationFn: (input: { userId: string; status: "approved" | "denied" }) =>
      decideMemberFn({ data: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["members"] });
      toast("Updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not update");
    },
  });

  const setRole = useMutation({
    mutationFn: (input: { userId: string; role: "admin" | "member" }) =>
      setMemberRoleFn({ data: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["members"] });
      toast("Role updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not update");
    },
  });

  if (isPending) {
    return (
      <div className="board-shell flex h-dvh items-center justify-center bg-background text-muted">
        Loading…
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (!isApproved) return <Navigate to="/waiting" />;
  if (!isAdmin) return <Navigate to="/" />;

  const rows = members.data ?? [];
  const pending = rows.filter((row) => row.status === "pending");
  const rest = rows.filter((row) => row.status !== "pending");

  return (
    <main className="board-shell min-h-dvh bg-background px-4 py-8 text-fg">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <AccountBar />
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-[0.04em]">
              Members
            </h1>
            <p className="mt-1 text-sm text-muted">
              Approve who can use the shared board.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/">Back to board</Link>
          </Button>
        </div>

        {pending.length > 0 ? (
          <section className="space-y-2">
            <h2 className="text-sm font-medium text-muted">Pending</h2>
            <ul className="grid gap-2">
              {pending.map((member) => (
                <MemberRow
                  key={member.userId}
                  member={member}
                  busy={decide.isPending || setRole.isPending}
                  onApprove={() =>
                    decide.mutate({ userId: member.userId, status: "approved" })
                  }
                  onDeny={() =>
                    decide.mutate({ userId: member.userId, status: "denied" })
                  }
                />
              ))}
            </ul>
          </section>
        ) : null}

        <section className="space-y-2">
          <h2 className="text-sm font-medium text-muted">Everyone</h2>
          {rest.length === 0 && pending.length === 0 ? (
            <p className="text-sm text-subtle">No members yet.</p>
          ) : (
            <ul className="grid gap-2">
              {rest.map((member) => (
                <MemberRow
                  key={member.userId}
                  member={member}
                  busy={decide.isPending || setRole.isPending}
                  onApprove={
                    member.status !== "approved"
                      ? () =>
                          decide.mutate({
                            userId: member.userId,
                            status: "approved",
                          })
                      : undefined
                  }
                  onDeny={
                    member.status === "approved"
                      ? () =>
                          decide.mutate({
                            userId: member.userId,
                            status: "denied",
                          })
                      : undefined
                  }
                  onMakeAdmin={
                    member.status === "approved" && member.role !== "admin"
                      ? () =>
                          setRole.mutate({
                            userId: member.userId,
                            role: "admin",
                          })
                      : undefined
                  }
                  onMakeMember={
                    member.status === "approved" && member.role === "admin"
                      ? () =>
                          setRole.mutate({
                            userId: member.userId,
                            role: "member",
                          })
                      : undefined
                  }
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function MemberRow({
  member,
  busy,
  onApprove,
  onDeny,
  onMakeAdmin,
  onMakeMember,
}: {
  member: {
    userId: string;
    email: string;
    name: string;
    image: string | null;
    role: string;
    status: string;
  };
  busy: boolean;
  onApprove?: () => void;
  onDeny?: () => void;
  onMakeAdmin?: () => void;
  onMakeMember?: () => void;
}) {
  const label = member.name || member.email || "Unknown";
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-surface px-3 py-3 shadow-[var(--shadow-border)]">
      <div className="flex min-w-0 items-center gap-3">
        {member.image ? (
          <img
            src={member.image}
            alt=""
            className="size-9 rounded-full object-cover"
          />
        ) : (
          <span className="grid size-9 place-items-center rounded-full bg-elevated text-sm font-medium">
            {label.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{label}</p>
          <p className="truncate text-xs text-subtle">{member.email}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill status={member.status} role={member.role} />
        {onApprove ? (
          <Button disabled={busy} onClick={onApprove}>
            Approve
          </Button>
        ) : null}
        {onDeny ? (
          <Button variant="outline" disabled={busy} onClick={onDeny}>
            Deny
          </Button>
        ) : null}
        {onMakeAdmin ? (
          <Button variant="ghost" disabled={busy} onClick={onMakeAdmin}>
            Make admin
          </Button>
        ) : null}
        {onMakeMember ? (
          <Button variant="ghost" disabled={busy} onClick={onMakeMember}>
            Make member
          </Button>
        ) : null}
      </div>
    </li>
  );
}

function StatusPill({ status, role }: { status: string; role: string }) {
  const label =
    status === "approved"
      ? role === "admin"
        ? "Admin"
        : "Approved"
      : status === "denied"
        ? "Denied"
        : "Pending";
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        status === "approved" && "bg-done/15 text-done",
        status === "pending" && "bg-doing/15 text-doing",
        status === "denied" && "bg-danger/15 text-danger",
      )}
    >
      {label}
    </span>
  );
}
