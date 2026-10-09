import { Component, OnInit, inject, signal } from '@angular/core';
import { Memory } from '../../core/models/memory.model';
import { MemoryService } from '../../core/services/memory.service';

const USER_ID = 'user-123';

@Component({
  selector: 'app-memory',
  standalone: true,
  templateUrl: './memory.component.html',
  styleUrl: './memory.component.css'
})
export class MemoryComponent implements OnInit {
  private readonly memoryService = inject(MemoryService);

  protected readonly memories = signal<Memory[]>([]);
  protected readonly key = signal('');
  protected readonly value = signal('');
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly deletingKeys = signal<ReadonlySet<string>>(new Set());
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadMemories();
  }

  protected updateKey(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLInputElement) {
      this.key.set(input.value);
    }
  }

  protected updateValue(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLTextAreaElement) {
      this.value.set(input.value);
    }
  }

  protected saveMemory(event: Event): void {
    event.preventDefault();

    const key = this.key().trim();
    const value = this.value().trim();
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (!key || !value) {
      this.errorMessage.set('Enter both a key and a value to save a memory.');
      return;
    }

    this.isSaving.set(true);
    this.memoryService.createMemory(USER_ID, key, value).subscribe({
      next: (memory) => {
        this.memories.update((memories) => {
          const existingIndex = memories.findIndex((item) => item.key === memory.key);
          if (existingIndex === -1) {
            return [memory, ...memories];
          }

          return memories.map((item) => item.key === memory.key ? memory : item);
        });
        this.key.set('');
        this.value.set('');
        this.successMessage.set('Memory saved.');
        this.isSaving.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to save this memory. Please try again.');
        this.isSaving.set(false);
      }
    });
  }

  protected deleteMemory(memory: Memory): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.deletingKeys.update((keys) => new Set(keys).add(memory.key));

    this.memoryService.deleteMemory(USER_ID, memory.key).subscribe({
      next: () => {
        this.memories.update((memories) => memories.filter((item) => item.key !== memory.key));
        this.successMessage.set('Memory deleted.');
        this.deletingKeys.update((keys) => {
          const updatedKeys = new Set(keys);
          updatedKeys.delete(memory.key);
          return updatedKeys;
        });
      },
      error: () => {
        this.errorMessage.set('Unable to delete this memory. Please try again.');
        this.deletingKeys.update((keys) => {
          const updatedKeys = new Set(keys);
          updatedKeys.delete(memory.key);
          return updatedKeys;
        });
      }
    });
  }

  private loadMemories(): void {
    this.memoryService.getMemories(USER_ID).subscribe({
      next: (memories) => {
        this.memories.set(memories);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load memories.');
        this.isLoading.set(false);
      }
    });
  }
}