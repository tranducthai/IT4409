import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Discussion } from '../../discussions/entities/discussion.entity';

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    discussion_id: string;

    @ManyToOne(() => Discussion, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'discussion_id' })
    discussion: Discussion;

    @Column({ type: 'uuid' })
    user_id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    author: User;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'text', nullable: true })
    image_url: string | null;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
}
