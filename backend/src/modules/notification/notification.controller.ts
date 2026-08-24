import {
  Controller,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
  Post,
} from '@nestjs/common';

import { NotificationService } from './notification.service';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { JwtAuthGuard } from '../../identity/auth/jwt-auth.guard';
import type { Request } from 'express';
import { NotificationType } from './enums/notification-type.enum';
import { NotificationEntityType } from './enums/notification-entity-type.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
  };
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    const [notifications, unreadCount] = await Promise.all([
      this.notificationService.findAll(user.id),
      this.notificationService.countUnread(user.id),
    ]);

    return {
      items: notifications.map(
        (notification) => new NotificationResponseDto(notification),
      ),
      unreadCount,
    };
  }
  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: AuthenticatedUser) {
    const count = await this.notificationService.countUnread(user.id);

    return {
      unreadCount: count,
    };
  }
  @Put('read-all')
  async markAllAsRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationService.markAllAsRead(user.id);
  }
  @Get(':id')
  async findById(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;

    const notification = await this.notificationService.findById(id, userId);

    return new NotificationResponseDto(notification);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;

    const notification = await this.notificationService.markAsRead(id, userId);

    return new NotificationResponseDto(notification);
  }
  @Post('test')
  async testNotification(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationService.create({
      recipientId: user.id,
      actorId: user.id,
      type: NotificationType.FOLLOW,
      entityType: NotificationEntityType.USER,
      entityId: user.id,
      title: 'Test notification',
      message: 'This is a realtime notification',
    });
  }
}
