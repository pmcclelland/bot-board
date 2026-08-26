/** Slack so sub-pixel clamp rounding does not count as overflow. */
const OVERFLOW_SLACK = 1;

/** True when a clamped dek is hiding text. */
export function dekOverflows(scrollHeight: number, visibleHeight: number) {
  return scrollHeight > visibleHeight + OVERFLOW_SLACK;
}
