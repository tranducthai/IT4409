import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from '../../messages/entities/message.entity';

@Entity('discussions')
export class Discussion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    class_id: string;

    @Column({ type: 'uuid' })
    created_by: string;

    @Column({ type: 'varchar' })
    title: string;

    @Column({ type: 'text', nullable: true })
    content: string | null;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @OneToMany(() => Message, (m) => m.discussion)
    messages: Message[];
}
