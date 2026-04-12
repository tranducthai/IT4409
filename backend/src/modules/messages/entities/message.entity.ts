import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
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

    @Column({ type: 'text' })
    content: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
}
