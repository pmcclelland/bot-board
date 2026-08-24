import { useState } from "react";
import { BotMark } from "./bot-mark";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { displayHandle } from "@/lib/board/credentials";

export function AccountBar() {
  const user = useCurrentUser();
  const [signingOut, setSigningOut] = useState(false);
  const label = user?.displayName ?? user?.primaryEmail ?? "Account";

  return (
    <header className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <BotMark className="size-8 shrink-0" />
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold tracking-[0.04em] text-fg">
            Bot Board
          </p>
          {user?.primaryEmail ? (
            <p className="truncate text-xs text-subtle">
              {displayHandle(user.primaryEmail)}
            </p>
          ) : (
            <p className="truncate text-xs text-subtle">{label}</p>
          )}
        </div>
      </div>
      <Button
        variant="outline"
        disabled={signingOut}
        onClick={() => {
          setSigningOut(true);
          void signOut().catch(() => setSigningOut(false));
        }}
      >
        {signingOut ? "Signing out…" : "Log out"}
      </Button>
    </header>
  );
}
