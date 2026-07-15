import { api } from './client';

export interface MessageResponseDto {
  id: number;
  conversationId: number;
  senderId: string;
  content: string;
  sentAt: string;
  read: boolean;
}

export interface ConversationResponseDto {
  id: number;
  participantOne: string;
  participantTwo: string;
  createdAt: string;
  updatedAt: string;
  lastMessage: MessageResponseDto | null;
}

export interface ConversationRequestDto {
  participantOne: string;
  participantTwo: string;
}

export interface MessageRequestDto {
  senderId: string;
  content: string;
}

export function createConversation(dto: ConversationRequestDto) {
  return api.post<ConversationResponseDto>('/api/conversations', dto);
}

export function getConversation(id: number) {
  return api.get<ConversationResponseDto>(`/api/conversations/${id}`);
}

export function getConversationsForUser(userId: string) {
  return api.get<ConversationResponseDto[]>(`/api/conversations/user/${encodeURIComponent(userId)}`);
}

export function getMessages(conversationId: number) {
  return api.get<MessageResponseDto[]>(`/api/conversations/${conversationId}/messages`);
}

export function sendMessage(conversationId: number, dto: MessageRequestDto) {
  return api.post<MessageResponseDto>(`/api/conversations/${conversationId}/messages`, dto);
}

export function markMessagesRead(conversationId: number, userId: string) {
  return api.patch<{ conversationId: number; userId: string; messagesMarkedAsRead: number }>(
    `/api/conversations/${conversationId}/messages/read`,
    undefined,
    { userId }
  );
}
