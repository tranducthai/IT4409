import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { NotificationType } from '../enums/notification-type.enum';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'enum', enum: NotificationType })
    type: NotificationType;

    @Column({ type: 'varchar' })
    title: string;

    @Column({ type: 'text', nullable: true })
    message: string | null;

    @Column({ type: 'boolean', default: false })
    is_read: boolean;

    @Column({ type: 'timestamp', nullable: true })
    read_at: Date | null;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
}
