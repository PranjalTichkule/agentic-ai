export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface Message {
  _id?: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}