import { Component, computed, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-message-input',
  standalone: true,
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.css'
})
export class MessageInputComponent {
  readonly disabled = input(false);
  readonly submitMessage = output<string>();

  protected readonly draft = signal('');
  protected readonly canSubmit = computed(
    () => this.draft().trim().length > 0 && !this.disabled()
  );

  protected onInput(event: Event): void {
    this.draft.set((event.target as HTMLTextAreaElement).value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
    }
  }

  protected submit(): void {
    const message = this.draft().trim();
    if (!message || this.disabled()) {
      return;
    }

    this.submitMessage.emit(message);
    this.draft.set('');
  }
}