import { KeyRound, Plus, Users } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { displayHandle } from "@/lib/board/credentials";
import { BotMark } from "./bot-mark";
import { useState } from "react";

type BoardHeaderProps = {
  onAdd: () => void;
  isAdmin?: boolean;
};

export function BoardHeader({ onAdd, isAdmin }: BoardHeaderProps) {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const label = user?.displayName ?? user?.primaryEmail ?? "Account";

  return (
    <header className="flex items-center justify-between gap-3 px-0.5 md:px-1">
      <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2.5 md:gap-x-3">
        <BotMark className="size-8 shrink-0 md:size-10" />
        <h1 className="font-display text-2xl leading-none font-semibold tracking-[0.04em] text-fg md:text-4xl">
          Bot Board
        </h1>
        <p className="col-start-2 mt-0.5 hidden text-xs text-muted md:mt-1 md:block md:text-sm text-pretty">
          Tasks your bots are working on.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button onClick={onAdd} className="mr-2 hidden sm:inline-flex">
          <Plus className="size-4" />
          New task
        </Button>
        <Button
          onClick={onAdd}
          size="icon"
          className="mr-2 sm:hidden"
          aria-label="New task"
        >
          <Plus className="size-4" />
        </Button>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Account menu"
                className="overflow-hidden"
              >
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt=""
                    className="size-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid size-8 place-items-center rounded-full bg-elevated text-sm font-medium text-fg">
                    {label.charAt(0).toUpperCase()}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2.5 py-2">
                <p className="truncate text-sm font-medium text-fg">{label}</p>
                {user.primaryEmail ? (
                  <p className="truncate text-xs text-subtle">
                    {displayHandle(user.primaryEmail)}
                  </p>
                ) : null}
              </div>
              {isAdmin ? (
                <DropdownMenuItem onSelect={() => navigate({ to: "/members" })}>
                  <Users className="size-4" />
                  Members
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onSelect={() => navigate({ to: "/settings" })}>
                <KeyRound className="size-4" />
                API tokens
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={signingOut}
                onSelect={() => {
                  setSigningOut(true);
                  void signOut().catch(() => setSigningOut(false));
                }}
              >
                {signingOut ? "Signing out…" : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="size-8 animate-pulse rounded-full bg-elevated" />
        )}
      </div>
    </header>
  );
}
