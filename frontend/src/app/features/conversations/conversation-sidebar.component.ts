import { Component, OnInit, inject, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Conversation } from '../../core/models/conversation.model';
import { ConversationService } from '../../core/services/conversation.service';

@Component({
  selector: 'app-conversation-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './conversation-sidebar.component.html',
  styleUrl: './conversation-sidebar.component.css'
})
export class ConversationSidebarComponent implements OnInit {
  private readonly conversationService = inject(ConversationService);

  protected readonly conversations = signal<Conversation[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isCreating = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly activeConversationId = signal<string | null>(null);
  readonly conversationSelected = output<string>();

  ngOnInit(): void {
    this.loadConversations();
  }

  protected createConversation(): void {
    this.isCreating.set(true);
    this.errorMessage.set(null);

    this.conversationService.createConversation('New Conversation').subscribe({
      next: (conversation) => {
        this.conversations.update((conversations) => [
          conversation,
          ...conversations.filter((item) => item._id !== conversation._id)
        ]);
        this.selectConversation(conversation);
        this.isCreating.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to create a conversation. Please try again.');
        this.isCreating.set(false);
      }
    });
  }

  protected selectConversation(conversation: Conversation): void {
    this.activeConversationId.set(conversation._id);
    this.conversationSelected.emit(conversation._id);
  }

  private loadConversations(): void {
    this.conversationService.getConversations().subscribe({
      next: (conversations) => {
        this.conversations.set(conversations);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load conversations. Please try again.');
        this.isLoading.set(false);
      }
    });
  }
}