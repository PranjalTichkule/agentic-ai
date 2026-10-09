import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConversationSidebarComponent } from './features/conversations/conversation-sidebar.component';
import { ConversationSelectionService } from './core/services/conversation-selection.service';

@Component({
  selector: 'app-root',
  imports: [ConversationSidebarComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly conversationSelection = inject(ConversationSelectionService);

  protected onConversationSelected(conversationId: string): void {
    this.conversationSelection.selectConversation(conversationId);
  }
}
