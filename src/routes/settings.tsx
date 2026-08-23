import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useMembership } from "@/lib/board/use-membership";
import {
  createTokenFn,
  listTokensFn,
  revokeTokenFn,
} from "@/lib/board/server-fns";

export const Route = createFileRoute("/settings")({ component: Settings });

function Settings() {
  const { user, isPending, isApproved } = useMembership();
  const queryClient = useQueryClient();
  const [name, setName] = useState("Grok Bot");
  const [secret, setSecret] = useState<string | null>(null);

  const tokens = useQuery({
    queryKey: ["tokens"],
    queryFn: () => listTokensFn(),
    enabled: Boolean(user) && isApproved,
  });

  const createToken = useMutation({
    mutationFn: () => createTokenFn({ data: { name } }),
    onSuccess: (created) => {
      setSecret(created.secret);
      void queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });

  const revokeToken = useMutation({
    mutationFn: (id: string) => revokeTokenFn({ data: { id } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tokens"] });
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

  return (
    <main className="board-shell min-h-dvh bg-background px-4 py-10 text-fg">
      <div className="mx-auto w-full max-w-lg space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-[0.04em]">
              API tokens
            </h1>
            <p className="mt-1 text-sm text-muted">
              Mint a token for MCP or REST. The secret is shown once.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/">Back to board</Link>
          </Button>
        </div>

        <form
          className="grid gap-3 rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]"
          onSubmit={(event) => {
            event.preventDefault();
            createToken.mutate();
          }}
        >
          <Label htmlFor="token-name">Token name</Label>
          <Input
            id="token-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Grok Bot"
          />
          <Button type="submit" disabled={createToken.isPending}>
            {createToken.isPending ? "Creating…" : "Create token"}
          </Button>
          {secret ? (
            <p className="break-all rounded-sm bg-elevated p-3 text-sm text-fg">
              {secret}
            </p>
          ) : null}
        </form>

        <ul className="grid gap-2">
          {(tokens.data ?? []).map((token) => (
            <li
              key={token.id}
              className="flex items-center justify-between gap-3 rounded-md bg-surface px-3 py-2 shadow-[var(--shadow-border)]"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{token.name}</p>
                <p className="text-xs text-subtle">{token.prefix}…</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => revokeToken.mutate(token.id)}
              >
                Revoke
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
