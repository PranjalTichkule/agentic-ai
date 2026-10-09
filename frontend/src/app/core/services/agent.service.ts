import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AgentRequest, AgentResponse } from '../models/agent.model';

@Injectable({ providedIn: 'root' })
export class AgentService {
	private readonly agentUrl = `${environment.apiBaseUrl}/api/agent`;

	constructor(private readonly http: HttpClient) {}

	sendMessage(request: AgentRequest): Observable<AgentResponse> {
		return this.http.post<AgentResponse>(this.agentUrl, request);
	}
}