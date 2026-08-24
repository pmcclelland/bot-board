import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { BotMark } from "@/components/kanban/bot-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GROK_PROVIDERS,
  authClient,
  authEnabled,
  signIn,
  signInWithGoogle,
} from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { parseBotLogin } from "@/lib/board/credentials";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (isPending) {
    return (
      <div className="board-shell flex h-dvh items-center justify-center bg-background text-muted">
        Loading…
      </div>
    );
  }
  if (user) return <Navigate to="/" />;

  async function handleEmail(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const parsed = parseBotLogin(username);
      if (!parsed.ok) throw new Error(parsed.error);
      if (mode === "signup") {
        const { error: signUpError } = await authClient.signUp.email({
          email: parsed.email,
          password,
          name: parsed.username,
        });
        if (signUpError) throw new Error(signUpError.message ?? "Sign up failed");
      }
      const { error: signInError } = await authClient.signIn.email({
        email: parsed.email,
        password,
      });
      if (signInError) throw new Error(signInError.message ?? "Sign in failed");
      await authClient.getSession();
      await navigate({ to: "/" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign in");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="board-shell grid min-h-dvh place-items-center px-4 py-10 text-fg">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <BotMark className="size-12" />
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-[0.04em]">
              Bot Board
            </h1>
            <p className="mt-1 text-sm text-muted">
              Sign in to the shared board. Humans use Google. Bots use a
              username and password.
            </p>
          </div>
        </div>

        {authEnabled ? (
          <>
            <div className="grid gap-2">
              <Button
                type="button"
                onClick={() => signInWithGoogle({ callbackURL: "/" })}
              >
                Continue with Google
              </Button>
              {GROK_PROVIDERS.filter((provider) => provider.idp !== "google").map(
                (provider) => (
                  <Button
                    key={provider.providerId}
                    type="button"
                    variant="outline"
                    onClick={() =>
                      signIn(provider.providerId, { callbackURL: "/" })
                    }
                  >
                    Continue with {provider.label}
                  </Button>
                ),
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-subtle">
              <span className="h-px flex-1 bg-border" />
              Bots
              <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleEmail} className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="bot-username">Username</Label>
                <Input
                  id="bot-username"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter a username"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bot-password">Password</Label>
                <Input
                  id="bot-password"
                  type="password"
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                />
              </div>
              {error ? (
                <p className="text-sm text-danger" role="alert">
                  {error}
                </p>
              ) : null}
              <Button type="submit" variant="secondary" disabled={pending}>
                {pending
                  ? "Working…"
                  : mode === "signup"
                    ? "Create bot account"
                    : "Sign in with username"}
              </Button>
              <button
                type="button"
                className="text-xs text-subtle hover:text-fg"
                onClick={() =>
                  setMode((current) =>
                    current === "signin" ? "signup" : "signin",
                  )
                }
              >
                {mode === "signup"
                  ? "Already have an account? Sign in"
                  : "Need an account for a bot? Sign up"}
              </button>
            </form>
          </>
        ) : (
          <p className="text-sm text-muted">Sign-in is disabled.</p>
        )}
      </div>
    </main>
  );
}
