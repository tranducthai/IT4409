import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Assignment } from './assignment.entity';

@Entity('assignment_attachments')
export class AssignmentAttachment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    assignment_id: string;

    @ManyToOne(() => Assignment, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'assignment_id' })
    assignment: Assignment;

    @Column({ type: 'varchar' })
    file_url: string;

    @Column({ type: 'varchar' })
    original_name: string;

    @Column({ type: 'varchar' })
    file_name: string;

    @Column({ type: 'varchar' })
    mime_type: string;

    @Column({ type: 'integer' })
    size: number;

    @CreateDateColumn({ type: 'timestamp' })
    uploaded_at: Date;
}
