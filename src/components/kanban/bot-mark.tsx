export function BotMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="20" cy="20" r="19" fill="#1e262f" />
      <circle cx="20" cy="20" r="16.5" fill="#f3f0e8" />
      <circle cx="20" cy="20" r="19" fill="none" stroke="#2fd3c4" strokeWidth="2.2" />
      <g fill="#0b1014" transform="rotate(-20 20 20)">
        <rect x="12.2" y="13.5" width="4.2" height="11" rx="2.1" />
        <rect x="23.6" y="13.5" width="4.2" height="11" rx="2.1" />
      </g>
    </svg>
  );
}
