import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Assignment } from '../../assignments/entities/assignment.entity';

@Entity('assignment_submissions')
export class Submission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    assignment_id: string;

    @ManyToOne(() => Assignment, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'assignment_id' })
    assignment: Assignment;

    @Column({ type: 'uuid' })
    student_id: string;

    @Column({ type: 'text', nullable: true })
    content: string | null;

    @Column({ type: 'varchar', nullable: true })
    file_url: string | null;

    @Column({ type: 'float', nullable: true })
    score: number | null;

    @Column({ type: 'text', nullable: true })
    feedback: string | null;

    @CreateDateColumn({ type: 'timestamp' })
    submitted_at: Date;
}
