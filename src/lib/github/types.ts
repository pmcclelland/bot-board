export type GithubConnectionStatus = "connected" | "broken";

export type GithubConnectionPublic = {
  configured: boolean;
  connected: boolean;
  login: string | null;
  avatarUrl: string | null;
  status: GithubConnectionStatus | null;
  connectedAt: string | null;
};
