import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Check,
  MoreHorizontal,
  Pencil,
  ShieldOff,
} from "lucide-react";
import { toast } from "sonner";
import { AccountBar } from "@/components/kanban/account-bar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { isProfileEmail, publicProfileEmail } from "@/lib/board/credentials";
import {
  decideMemberFn,
  listMembersFn,
  setMemberRoleFn,
  updateMemberProfileFn,
} from "@/lib/board/server-fns";
import { useMembership } from "@/lib/board/use-membership";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/members")({ component: Members });

type MemberRecord = {
  userId: string;
  email: string;
  name: string;
  description: string;
  image: string | null;
  role: "admin" | "member";
  status: "pending" | "approved" | "denied";
};

function Members() {
  const { user, isPending, isAdmin, isApproved } = useMembership();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<MemberRecord | null>(null);
  const members = useQuery({
    queryKey: ["members"],
    queryFn: () => listMembersFn(),
    enabled: isAdmin,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["members"] });
    void queryClient.invalidateQueries({ queryKey: ["membership"] });
  };

  const decide = useMutation({
    mutationFn: (input: { userId: string; status: "approved" | "denied" }) =>
      decideMemberFn({ data: input }),
    onSuccess: () => {
      invalidate();
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
      invalidate();
      toast("Role updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not update");
    },
  });

  const saveProfile = useMutation({
    mutationFn: (input: {
      userId: string;
      name: string;
      email: string;
      description: string;
    }) => updateMemberProfileFn({ data: input }),
    onSuccess: () => {
      invalidate();
      setEditing(null);
      toast("Profile saved");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not save");
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

  const rows = (members.data ?? []) as MemberRecord[];
  const pending = rows.filter((row) => row.status === "pending");
  const rest = rows.filter((row) => row.status !== "pending");
  const busy = decide.isPending || setRole.isPending || saveProfile.isPending;

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
                  isSelf={member.userId === user.id}
                  busy={busy}
                  onApprove={() =>
                    decide.mutate({ userId: member.userId, status: "approved" })
                  }
                  onEdit={() => setEditing(member)}
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
                  isSelf={member.userId === user.id}
                  busy={busy}
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
                  onUpgrade={
                    member.status === "approved" && member.role !== "admin"
                      ? () =>
                          setRole.mutate({
                            userId: member.userId,
                            role: "admin",
                          })
                      : undefined
                  }
                  onDowngrade={
                    member.status === "approved" && member.role === "admin"
                      ? () =>
                          setRole.mutate({
                            userId: member.userId,
                            role: "member",
                          })
                      : undefined
                  }
                  onEdit={() => setEditing(member)}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      <EditMemberDialog
        member={editing}
        pending={saveProfile.isPending}
        onClose={() => {
          if (!saveProfile.isPending) setEditing(null);
        }}
        onSave={(input) => saveProfile.mutate(input)}
      />
    </main>
  );
}

function MemberRow({
  member,
  isSelf,
  busy,
  onApprove,
  onDeny,
  onUpgrade,
  onDowngrade,
  onEdit,
}: {
  member: MemberRecord;
  isSelf: boolean;
  busy: boolean;
  onApprove?: () => void;
  onDeny?: () => void;
  onUpgrade?: () => void;
  onDowngrade?: () => void;
  onEdit: () => void;
}) {
  const email = publicProfileEmail(member.email);
  const label = member.name.trim() || email || "Unknown";
  const canApprove = Boolean(onApprove) && !isSelf;
  const canDeny = Boolean(onDeny) && !isSelf;
  const canUpgrade = Boolean(onUpgrade) && !isSelf;
  const canDowngrade = Boolean(onDowngrade) && !isSelf;

  return (
    <li className="flex items-center justify-between gap-3 rounded-md bg-surface px-3 py-3 shadow-[var(--shadow-border)]">
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
          {email ? (
            <p className="truncate text-xs text-subtle">{email}</p>
          ) : null}
          {member.description.trim() ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted">
              {member.description.trim()}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <StatusPill status={member.status} role={member.role} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Actions for ${label}`}
              disabled={busy}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {canApprove ? (
              <DropdownMenuItem disabled={busy} onSelect={onApprove}>
                <Check className="size-4" />
                Approve
              </DropdownMenuItem>
            ) : null}
            {canDeny ? (
              <DropdownMenuItem
                variant="danger"
                disabled={busy}
                onSelect={onDeny}
              >
                <ShieldOff className="size-4" />
                Deny
              </DropdownMenuItem>
            ) : null}
            {canUpgrade ? (
              <DropdownMenuItem disabled={busy} onSelect={onUpgrade}>
                <ArrowUp className="size-4" />
                Upgrade
              </DropdownMenuItem>
            ) : null}
            {canDowngrade ? (
              <DropdownMenuItem disabled={busy} onSelect={onDowngrade}>
                <ArrowDown className="size-4" />
                Downgrade
              </DropdownMenuItem>
            ) : null}
            {canApprove || canDeny || canUpgrade || canDowngrade ? (
              <DropdownMenuSeparator />
            ) : null}
            <DropdownMenuItem disabled={busy} onSelect={onEdit}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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

function OptionalLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: string;
}) {
  return (
    <Label htmlFor={htmlFor} className="flex items-baseline gap-2">
      <span>{children}</span>
      <span className="text-xs font-normal text-subtle">Optional</span>
    </Label>
  );
}

function EditMemberDialog({
  member,
  pending,
  onClose,
  onSave,
}: {
  member: MemberRecord | null;
  pending: boolean;
  onClose: () => void;
  onSave: (input: {
    userId: string;
    name: string;
    email: string;
    description: string;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    if (!member) return;
    setName(member.name);
    setEmail(publicProfileEmail(member.email));
    setDescription(member.description);
    setEmailError(null);
  }, [member]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!member) return;
    const trimmedEmail = email.trim();
    if (trimmedEmail && !isProfileEmail(trimmedEmail)) {
      setEmailError("Enter a valid email, or leave it blank.");
      return;
    }
    onSave({
      userId: member.userId,
      name,
      email: trimmedEmail,
      description,
    });
  }

  return (
    <Dialog open={Boolean(member)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Edit member</DialogTitle>
            <DialogDescription>
              Name, email, and description are all optional.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <OptionalLabel htmlFor="member-name">Name</OptionalLabel>
            <Input
              id="member-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              autoComplete="name"
            />
          </div>
          <div className="grid gap-2">
            <OptionalLabel htmlFor="member-email">Email</OptionalLabel>
            <Input
              id="member-email"
              type="text"
              inputMode="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setEmailError(null);
              }}
              maxLength={254}
              autoComplete="email"
              spellCheck={false}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? "member-email-error" : undefined}
            />
            {emailError ? (
              <p id="member-email-error" className="text-sm text-danger" role="alert">
                {emailError}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <OptionalLabel htmlFor="member-description">Description</OptionalLabel>
            <Textarea
              id="member-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={400}
              placeholder="Who this is, or how they use the board."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
