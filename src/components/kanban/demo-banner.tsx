import { Link } from "@tanstack/react-router";

export function DemoBanner() {
  return (
    <p className="rounded-lg bg-elevated px-3 py-2.5 text-sm text-muted shadow-[var(--shadow-hairline)] md:px-3.5">
      Sample board — drag cards, edit, try a filter. Changes stay in this tab.{" "}
      <Link to="/login" className="text-primary hover:underline">
        Sign in to save yours
      </Link>
      .
    </p>
  );
}
