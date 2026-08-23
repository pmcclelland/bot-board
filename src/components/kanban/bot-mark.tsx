"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const MOVES = ["think", "think", "think", "blink", "blink", "glance", "double-blink"] as const;

type Move = (typeof MOVES)[number];

const MOVE_MS: Record<Move, number> = {
  think: 1700,
  blink: 320,
  glance: 980,
  "double-blink": 620,
};

function nextDelay() {
  return 2600 + Math.random() * 8200;
}

function pickMove(): Move {
  return MOVES[Math.floor(Math.random() * MOVES.length)] ?? "think";
}

export function BotMark({ className }: { className?: string }) {
  const [move, setMove] = useState<Move | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    let cancelled = false;
    let playTimer = 0;
    let waitTimer = 0;

    function schedule(delay: number) {
      waitTimer = window.setTimeout(() => {
        if (cancelled) return;
        const next = pickMove();
        setMove(next);
        playTimer = window.setTimeout(() => {
          if (cancelled) return;
          setMove(null);
          schedule(nextDelay());
        }, MOVE_MS[next]);
      }, delay);
    }

    schedule(400 + Math.random() * 900);

    return () => {
      cancelled = true;
      window.clearTimeout(waitTimer);
      window.clearTimeout(playTimer);
    };
  }, []);

  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("bot-mark", move && `bot-mark-${move}`, className)}
      aria-hidden="true"
      focusable="false"
    >
      <circle className="bot-mark-shell" cx="20" cy="20" r="19" />
      <circle className="bot-mark-face" cx="20" cy="20" r="16.5" />
      <circle className="bot-mark-ring" cx="20" cy="20" r="19" fill="none" />
      <g transform="rotate(-20 20 20)">
        <g className="bot-mark-eyes">
          <rect
            className="bot-mark-eye bot-mark-eye-left"
            x="12.2"
            y="13.5"
            width="4.2"
            height="11"
            rx="2.1"
          />
          <rect
            className="bot-mark-eye bot-mark-eye-right"
            x="23.6"
            y="13.5"
            width="4.2"
            height="11"
            rx="2.1"
          />
        </g>
      </g>
    </svg>
  );
}
