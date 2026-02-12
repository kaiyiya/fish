export class CreateNotificationDto {
  userId: number;
  type: 'order' | 'system' | 'promotion' | 'review';
  title: string;
  content?: string;
  relatedId?: number;
}
