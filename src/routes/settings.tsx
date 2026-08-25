import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useMembership } from "@/lib/board/use-membership";
import {
  createTokenFn,
  disconnectGithubFn,
  getGithubConnectionFn,
  listTokensFn,
  revokeTokenFn,
  startGithubConnectFn,
} from "@/lib/board/server-fns";
import type { GithubConnectionPublic } from "@/lib/github/types";
import { cn } from "@/lib/utils";

const GITHUB_ERRORS: Record<string, string> = {
  denied: "GitHub access was cancelled.",
  not_configured: "GitHub is not configured for this board.",
  bots: "Bots cannot connect GitHub.",
  state: "That GitHub link expired. Try connecting again.",
  exchange: "Could not connect GitHub. Try again.",
};

type SettingsSearch = {
  github?: string;
  github_error?: string;
};

export const Route = createFileRoute("/settings")({
  validateSearch: (search: Record<string, unknown>): SettingsSearch => ({
    github: typeof search.github === "string" ? search.github : undefined,
    github_error:
      typeof search.github_error === "string" ? search.github_error : undefined,
  }),
  component: Settings,
});

function Settings() {
  const { user, isPending, isApproved, isBot } = useMembership();
  const { github, github_error: githubError } = Route.useSearch();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [secret, setSecret] = useState<string | null>(null);

  const tokens = useQuery({
    queryKey: ["tokens"],
    queryFn: () => listTokensFn(),
    enabled: Boolean(user) && isApproved,
  });

  const githubConnection = useQuery({
    queryKey: ["github-connection"],
    queryFn: () => getGithubConnectionFn(),
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

  const disconnectGithub = useMutation({
    mutationFn: () => disconnectGithubFn(),
    onSuccess: (next) => {
      queryClient.setQueryData(["github-connection"], next);
      void queryClient.invalidateQueries({ queryKey: ["board"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not disconnect");
    },
  });

  const startGithub = useMutation({
    mutationFn: () => startGithubConnectFn(),
    onSuccess: (result) => {
      window.location.assign(result.url);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not connect GitHub");
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
      <div className="mx-auto w-full max-w-lg space-y-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-[0.04em]">
              Settings
            </h1>
            <p className="mt-1 text-sm text-muted">
              Connect GitHub for the project list, and mint tokens for MCP.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/">Back to board</Link>
          </Button>
        </div>

        <GithubCard
          connection={githubConnection.data}
          loading={githubConnection.isPending}
          isBot={isBot}
          notice={
            github === "connected"
              ? "GitHub connected. Repositories are now the board projects."
              : githubError
                ? (GITHUB_ERRORS[githubError] ?? "Could not connect GitHub.")
                : null
          }
          noticeTone={github === "connected" ? "ok" : githubError ? "error" : null}
          disconnecting={disconnectGithub.isPending}
          connecting={startGithub.isPending}
          onDisconnect={() => disconnectGithub.mutate()}
          onConnect={() => startGithub.mutate()}
        />

        <section className="space-y-4">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-[0.04em]">
              API tokens
            </h2>
            <p className="mt-1 text-sm text-muted">
              Mint a token for MCP or REST. The secret is shown once.
            </p>
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
              placeholder="MCP"
            />
            <Button
              type="submit"
              variant="outline"
              className="w-full sm:w-auto sm:justify-self-start"
              disabled={createToken.isPending}
            >
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
        </section>
      </div>
    </main>
  );
}

function GithubFace({
  src,
  initial,
}: {
  src?: string | null;
  initial?: string | null;
}) {
  const letter = initial?.trim().slice(0, 1).toUpperCase() ?? "";
  const empty = !src && !letter;
  return (
    <span
      className={cn(
        "grid size-10 shrink-0 place-items-center overflow-hidden rounded-full",
        empty
          ? "bg-transparent shadow-[var(--shadow-hairline)]"
          : "bg-elevated shadow-[var(--shadow-border)]",
      )}
    >
      {src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : letter ? (
        <span className="text-sm font-medium">{letter}</span>
      ) : null}
    </span>
  );
}

function GithubCard({
  connection,
  loading,
  isBot,
  notice,
  noticeTone,
  disconnecting,
  connecting,
  onDisconnect,
  onConnect,
}: {
  connection: GithubConnectionPublic | undefined;
  loading: boolean;
  isBot: boolean;
  notice: string | null;
  noticeTone: "ok" | "error" | null;
  disconnecting: boolean;
  connecting: boolean;
  onDisconnect: () => void;
  onConnect: () => void;
}) {
  const connected = Boolean(connection?.connected);
  const broken = connection?.status === "broken";
  const configured = connection?.configured ?? true;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-lg font-semibold tracking-[0.04em]">
          GitHub
        </h2>
        <p className="mt-1 text-sm text-muted">
          One account for the shared board. Its repositories become the project
          list.
        </p>
      </div>

      <div className="grid gap-3 rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
        {notice ? (
          <p
            className={
              noticeTone === "error" ? "text-sm text-danger" : "text-sm text-muted"
            }
            role={noticeTone === "error" ? "alert" : undefined}
          >
            {notice}
          </p>
        ) : null}

        <div className="flex items-center gap-3">
          <GithubFace
            src={connected ? connection?.avatarUrl : null}
            initial={connected ? connection?.login : null}
          />
          <p
            className={cn(
              "min-w-0 truncate text-sm leading-10",
              connected ? "font-medium text-fg" : "text-muted",
            )}
          >
            {loading
              ? "Loading…"
              : connected
                ? (connection?.login ?? "GitHub")
                : "No GitHub account linked"}
          </p>
        </div>

        {broken ? (
          <p className="text-xs text-subtle">
            Access was revoked. Reconnect to refresh projects.
          </p>
        ) : null}

        {!connected && !configured ? (
          <p className="text-sm text-subtle">
            GitHub is not configured for this board.
          </p>
        ) : null}

        {isBot ? (
          <p className="text-xs text-subtle">Humans manage this link.</p>
        ) : loading ? null : connected ? (
          broken ? (
            <Button disabled={connecting} onClick={onConnect}>
              {connecting ? "Redirecting…" : "Reconnect"}
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled={disconnecting}
              onClick={onDisconnect}
            >
              {disconnecting ? "Disconnecting…" : "Disconnect"}
            </Button>
          )
        ) : (
          <Button disabled={!configured || connecting} onClick={onConnect}>
            {connecting ? "Redirecting…" : "Connect GitHub"}
          </Button>
        )}
      </div>
    </section>
  );
}
