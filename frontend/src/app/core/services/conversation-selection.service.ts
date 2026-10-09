import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConversationSelectionService {
  readonly selectedConversationId = signal<string | null>(null);

  selectConversation(conversationId: string): void {
    this.selectedConversationId.set(conversationId);
  }
}