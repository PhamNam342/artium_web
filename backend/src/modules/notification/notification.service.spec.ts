import { NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';

describe('NotificationService access control', () => {
  it('does not expose a notification to another recipient', async () => {
    const repository = { findOne: jest.fn().mockResolvedValue(null) };
    const service = new NotificationService(repository as unknown as Repository<Notification>, {} as never);

    await expect(service.findById('notification-id', 'other-user-id')).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: 'notification-id', recipientId: 'other-user-id' },
      relations: ['actor'],
    });
  });
});
