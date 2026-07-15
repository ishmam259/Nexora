import { api } from './client';

export interface AiQueryRequestDto {
  userId: string;
  query: string;
  queryType: string;
}

export interface AiQueryResponseDto {
  id: number;
  userId: string;
  query: string;
  response: string;
  queryType: string;
  timestamp: string;
}

export function askAi(userId: string, query: string) {
  return api.post<AiQueryResponseDto>('/api/ai/chat', { userId, query, queryType: 'CHAT' });
}

export function getAiHistory(userId: string) {
  return api.get<AiQueryResponseDto[]>(`/api/ai/history/${encodeURIComponent(userId)}`);
}
