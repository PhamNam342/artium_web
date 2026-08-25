import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../../identity/user/entities/user.entity';
import { NotificationType } from '../enums/notification-type.enum';
import { NotificationEntityType } from '../enums/notification-entity-type.enum';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'recipient_id' })
  recipientId!: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipient_id' })
  recipient!: User;

  @Column({ name: 'actor_id', nullable: true })
  actorId!: string | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'actor_id' })
  actor!: User | null;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type!: NotificationType;

  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: NotificationEntityType,
  })
  entityType!: NotificationEntityType;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId!: string;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({
    name: 'is_read',
    default: false,
  })
  isRead!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
