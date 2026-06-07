import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationsRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  createOne(data: Partial<Notification>) {
    return this.repo.save(this.repo.create(data));
  }

  findByUserId(user_id: string, limit = 30) {
    return this.repo.find({
      where: { user_id },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  countUnread(user_id: string) {
    return this.repo.count({ where: { user_id, is_read: false } });
  }

  async markAsRead(id: string, user_id: string) {
    await this.repo.update({ id, user_id }, { is_read: true, read_at: new Date() });
  }

  async markAllAsRead(user_id: string) {
    await this.repo.update({ user_id, is_read: false }, { is_read: true, read_at: new Date() });
  }
}
