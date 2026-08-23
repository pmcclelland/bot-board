import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AccountBar } from "@/components/kanban/account-bar";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useMembership } from "@/lib/board/use-membership";

export const Route = createFileRoute("/waiting")({ component: Waiting });

function Waiting() {
  const { user, isPending, membership, isApproved } = useMembership();

  if (isPending) {
    return (
      <div className="board-shell flex h-dvh items-center justify-center bg-background text-muted">
        Loading…
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (isApproved) return <Navigate to="/" />;

  const denied = membership?.status === "denied";

  return (
    <main className="board-shell grid min-h-dvh place-items-center px-4 py-10 text-fg">
      <div className="w-full max-w-md space-y-8">
        <AccountBar />
        <div className="space-y-3 rounded-lg bg-surface p-5 shadow-[var(--shadow-border)]">
          <h1 className="font-display text-2xl font-semibold tracking-[0.04em]">
            {denied ? "Access declined" : "Waiting for approval"}
          </h1>
          <p className="text-sm text-muted text-pretty">
            {denied
              ? "An admin declined this account. If that was a mistake, ask them to approve you from Members."
              : "You’re signed in, but an admin still needs to approve you before you can use the shared board."}
          </p>
        </div>
      </div>
    </main>
  );
}
