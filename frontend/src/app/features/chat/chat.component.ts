import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { AgentService } from '../../core/services/agent.service';
import { ConversationSelectionService } from '../../core/services/conversation-selection.service';
import { ConversationService } from '../../core/services/conversation.service';
import { Message } from '../../core/models/message.model';
import { MessageInputComponent } from '../../shared/message-input.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [MessageInputComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  private readonly conversationService = inject(ConversationService);
  private readonly agentService = inject(AgentService);
  private readonly conversationSelection = inject(ConversationSelectionService);
  private readonly messagesElement = viewChild<ElementRef<HTMLDivElement>>('messagesContainer');

  protected readonly selectedConversationId = this.conversationSelection.selectedConversationId;
  protected readonly messages = signal<Message[]>([]);
  protected readonly isLoadingMessages = signal(false);
  protected readonly isSending = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    effect((onCleanup) => {
      const conversationId = this.selectedConversationId();
      this.messages.set([]);
      this.errorMessage.set(null);
      this.isSending.set(false);

      if (!conversationId) {
        this.isLoadingMessages.set(false);
        return;
      }

      this.isLoadingMessages.set(true);
      const subscription = this.conversationService.getMessages(conversationId).subscribe({
        next: (messages) => {
          this.messages.set(messages);
          this.isLoadingMessages.set(false);
          this.scrollToLatest();
        },
        error: () => {
          this.errorMessage.set('Unable to load this conversation. Please try again.');
          this.isLoadingMessages.set(false);
        }
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  protected sendMessage(message: string): void {
    const conversationId = this.selectedConversationId();
    const content = message.trim();

    if (!conversationId || !content || this.isSending()) {
      return;
    }

    this.errorMessage.set(null);
    this.messages.update((messages) => [
      ...messages,
      { conversationId, role: 'user', content }
    ]);
    this.isSending.set(true);
    this.scrollToLatest();

    this.agentService.sendMessage({
      userId: 'user-123',
      conversationId,
      message: content
    }).subscribe({
      next: (response) => {
        if (this.selectedConversationId() !== conversationId) {
          return;
        }

        if (!response?.trim()) {
          this.errorMessage.set('The assistant did not return a response. Please try again.');
          this.isSending.set(false);
          return;
        }

        this.messages.update((messages) => [
          ...messages,
          { conversationId, role: 'assistant', content: response }
        ]);
        this.isSending.set(false);
        this.scrollToLatest();
      },
      error: () => {
        if (this.selectedConversationId() !== conversationId) {
          return;
        }

        this.errorMessage.set('Unable to send your message. Please try again.');
        this.isSending.set(false);
      }
    });
  }

  private scrollToLatest(): void {
    requestAnimationFrame(() => {
      const element = this.messagesElement()?.nativeElement;
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    });
  }
}