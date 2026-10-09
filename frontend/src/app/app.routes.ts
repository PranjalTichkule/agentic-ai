import { Routes } from '@angular/router';
import { ChatComponent } from './features/chat/chat.component';
import { MemoryComponent } from './components/memory/memory.component';
import { DocumentsComponent } from './features/documents/documents.component';
import { RedisComponent } from './features/redis/redis.component';

export const routes: Routes = [
	{ path: '', redirectTo: 'chat', pathMatch: 'full' },
	{ path: 'chat', component: ChatComponent },
	{ path: 'memories', component: MemoryComponent },
	{ path: 'documents', component: DocumentsComponent },
	{ path: 'redis', component: RedisComponent }
];
