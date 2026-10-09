import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Conversation } from '../models/conversation.model';
import { Message } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class ConversationService {
	private readonly conversationsUrl = `${environment.apiBaseUrl}/api/conversations`;

	constructor(private readonly http: HttpClient) {}

	getConversations(): Observable<Conversation[]> {
		return this.http.get<Conversation[]>(this.conversationsUrl);
	}

	createConversation(title: string): Observable<Conversation> {
		return this.http.post<Conversation>(this.conversationsUrl, { title });
	}

	getMessages(conversationId: string): Observable<Message[]> {
		const encodedConversationId = encodeURIComponent(conversationId);
		return this.http.get<Message[]>(
			`${environment.apiBaseUrl}/api/messages/${encodedConversationId}`
		);
	}
}