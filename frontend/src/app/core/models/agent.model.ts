export interface AgentRequest {
  userId: string;
  conversationId: string;
  message: string;
}

export type AgentResponse = string | null;