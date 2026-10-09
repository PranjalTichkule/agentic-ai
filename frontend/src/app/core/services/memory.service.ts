import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Memory } from '../models/memory.model';

@Injectable({ providedIn: 'root' })
export class MemoryService {
	private readonly memoriesUrl = `${environment.apiBaseUrl}/api/memories`;

	constructor(private readonly http: HttpClient) {}

	getMemories(userId: string): Observable<Memory[]> {
		return this.http.get<Memory[]>(`${this.memoriesUrl}/${encodeURIComponent(userId)}`);
	}

	getMemory(userId: string, key: string): Observable<Memory> {
		return this.http.get<Memory>(this.memoryUrl(userId, key));
	}

	createMemory(userId: string, key: string, value: string): Observable<Memory> {
		return this.http.post<Memory>(this.memoriesUrl, { userId, key, value });
	}

	deleteMemory(userId: string, key: string): Observable<{ message: string }> {
		return this.http.delete<{ message: string }>(this.memoryUrl(userId, key));
	}

	private memoryUrl(userId: string, key: string): string {
		return `${this.memoriesUrl}/${encodeURIComponent(userId)}/${encodeURIComponent(key)}`;
	}
}