import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Message } from '../../messages/entities/message.entity';

@Entity('discussions')
export class Discussion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    class_id: string;

    @Column({ type: 'uuid' })
    created_by: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'created_by' })
    author: User;

    @Column({ type: 'varchar' })
    title: string;

    @Column({ type: 'text', nullable: true })
    content: string | null;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @OneToMany(() => Message, (m) => m.discussion)
    messages: Message[];
}
