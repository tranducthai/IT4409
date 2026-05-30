import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Assignment } from '../../assignments/entities/assignment.entity';
import { User } from '../../users/entities/user.entity';
import { SubmissionFile } from './submission-file.entity';

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

    @ManyToOne(() => User)
    @JoinColumn({ name: 'student_id' })
    student: User;

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

    @OneToMany(() => SubmissionFile, (f) => f.submission)
    files: SubmissionFile[];
}
