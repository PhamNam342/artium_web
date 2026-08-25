import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationGateway } from './notification.gateway';
@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async create(data: CreateNotificationDto): Promise<Notification> {
    console.log('CREATE NOTIFICATION DATA:', data);
    const notification = this.notificationRepository.create({
      recipientId: data.recipientId,
      actorId: data.actorId ?? null,
      type: data.type,
      entityType: data.entityType,
      entityId: data.entityId,
      title: data.title,
      message: data.message,
      isRead: false,
    });

    const savedNotification =
      await this.notificationRepository.save(notification);

    const notificationWithActor = await this.notificationRepository.findOne({
      where: { id: savedNotification.id },
      relations: ['actor'],
    });

    if (notificationWithActor) {
      this.notificationGateway.sendToUser(
        data.recipientId,
        new NotificationResponseDto(notificationWithActor),
      );
      return notificationWithActor;
    }

    this.notificationGateway.sendToUser(
      data.recipientId,
      new NotificationResponseDto(savedNotification),
    );

    return savedNotification;
  }

  async findById(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: {
        id,
        recipientId: userId,
      },
      relations: ['actor'],
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.findById(id, userId);

    notification.isRead = true;

    return this.notificationRepository.save(notification);
  }
  async findAll(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: {
        recipientId: userId,
      },
      relations: ['actor'],
      order: {
        createdAt: 'DESC',
      },
    });
  }
  async countUnread(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });
  }
  async markAllAsRead(userId: string): Promise<{ affected: number }> {
    const result = await this.notificationRepository.update(
      {
        recipientId: userId,
        isRead: false,
      },
      {
        isRead: true,
      },
    );

    return {
      affected: result.affected ?? 0,
    };
  }
}
