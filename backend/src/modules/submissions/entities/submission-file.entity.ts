import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Submission } from './submission.entity';

@Entity('assignment_submission_files')
export class SubmissionFile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    submission_id: string;

    @ManyToOne(() => Submission, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'submission_id' })
    submission: Submission;

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
