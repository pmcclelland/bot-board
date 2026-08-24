/** AgentMail inboxes: `leo.pm@agentmail.to` or `ops@workspace.agentmail.to`. */
export function isAgentMailAddress(email: string) {
  return /^[^\s@]+@(?:[a-z0-9-]+\.)*agentmail\.to$/i.test(email.trim());
}
