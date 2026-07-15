import { api } from './client';

export type NotificationType = 'EMAIL' | 'SMS' | 'PUSH';
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface NotificationResponseDto {
  id: number;
  recipient: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  timestamp: string;
}

export function getNotificationsFor(recipient: string) {
  return api.get<NotificationResponseDto[]>(`/api/notifications/recipient/${encodeURIComponent(recipient)}`);
}
