import { createFileRoute, Navigate } from "@tanstack/react-router";
import { BotMark } from "@/components/kanban/bot-mark";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/client";
import { displayHandle } from "@/lib/board/credentials";
import { authorizeQueryString, parseAuthorizeParams } from "@/lib/board/mcp-oauth";
import { useMembership } from "@/lib/board/use-membership";

type ConsentSearch = {
  client_id?: string;
  redirect_uri?: string;
  response_type?: string;
  code_challenge?: string;
  code_challenge_method?: string;
  state?: string;
  scope?: string;
  resource?: string;
  client_name?: string;
};

export const Route = createFileRoute("/oauth/consent")({
  validateSearch: (search: Record<string, unknown>): ConsentSearch => ({
    client_id: typeof search.client_id === "string" ? search.client_id : undefined,
    redirect_uri: typeof search.redirect_uri === "string" ? search.redirect_uri : undefined,
    response_type: typeof search.response_type === "string" ? search.response_type : undefined,
    code_challenge:
      typeof search.code_challenge === "string" ? search.code_challenge : undefined,
    code_challenge_method:
      typeof search.code_challenge_method === "string"
        ? search.code_challenge_method
        : undefined,
    state: typeof search.state === "string" ? search.state : undefined,
    scope: typeof search.scope === "string" ? search.scope : undefined,
    resource: typeof search.resource === "string" ? search.resource : undefined,
    client_name: typeof search.client_name === "string" ? search.client_name : undefined,
  }),
  component: Consent,
});

function Consent() {
  const search = Route.useSearch();
  const { user, isPending, isApproved, membership } = useMembership();
  const params = parseAuthorizeParams(search);
  const loginTarget = `/login?callbackURL=${encodeURIComponent(`/oauth/authorize?${authorizeQueryString(params)}`)}`;
  const clientName = search.client_name?.trim() || "Cursor";
  const account =
    user?.displayName?.trim() ||
    (user?.primaryEmail ? displayHandle(user.primaryEmail) : "this account");

  if (isPending) {
    return (
      <div className="board-shell flex h-dvh items-center justify-center bg-background text-muted">
        Loading…
      </div>
    );
  }
  if (!user) {
    return (
      <Navigate
        to="/login"
        search={{
          callbackURL: `/oauth/authorize?${authorizeQueryString(params)}`,
        }}
      />
    );
  }
  if (!isApproved) return <Navigate to="/waiting" />;

  const denied = membership?.status === "denied";
  if (denied) return <Navigate to="/waiting" />;

  return (
    <main className="board-shell grid min-h-dvh place-items-center px-4 py-10 text-fg">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <BotMark className="size-12" />
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-[0.04em]">
              Connect {clientName}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {clientName} wants to use Bot Board as{" "}
              <span className="text-fg">{account}</span>. Writes will be stamped
              with this name.
            </p>
          </div>
        </div>

        <form method="post" action="/oauth/decision" className="grid gap-3">
          <input type="hidden" name="client_id" value={params.client_id} />
          <input type="hidden" name="redirect_uri" value={params.redirect_uri} />
          <input type="hidden" name="response_type" value={params.response_type} />
          <input type="hidden" name="code_challenge" value={params.code_challenge} />
          <input
            type="hidden"
            name="code_challenge_method"
            value={params.code_challenge_method}
          />
          <input type="hidden" name="state" value={params.state} />
          <input type="hidden" name="scope" value={params.scope} />
          <input type="hidden" name="resource" value={params.resource} />
          <Button type="submit" name="decision" value="allow">
            Allow
          </Button>
          <Button type="submit" name="decision" value="deny" variant="outline">
            Deny
          </Button>
        </form>

        <button
          type="button"
          className="w-full text-center text-xs text-subtle hover:text-fg"
          onClick={() => {
            void signOut(loginTarget);
          }}
        >
          Use a different account
        </button>
      </div>
    </main>
  );
}
