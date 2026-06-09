import { Injectable } from '@nestjs/common';
import { NotificationType } from './enums/notification-type.enum';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsRepository } from './repositories/notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly gateway: NotificationsGateway,
  ) {}

  async send(userId: string, type: NotificationType, title: string, message: string, link?: string) {
    const notification = await this.notificationsRepository.createOne({
      user_id: userId,
      type,
      title,
      message,
      link: link ?? null,
    });
    this.gateway.pushToUser(userId, notification);
    return notification;
  }

  getMyNotifications(userId: string) {
    return this.notificationsRepository.findByUserId(userId);
  }

  getUnreadCount(userId: string) {
    return this.notificationsRepository.countUnread(userId);
  }

  markAsRead(userId: string, id: string) {
    return this.notificationsRepository.markAsRead(id, userId);
  }

  markAllAsRead(userId: string) {
    return this.notificationsRepository.markAllAsRead(userId);
  }
}
