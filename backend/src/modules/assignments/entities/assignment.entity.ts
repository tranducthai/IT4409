import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Submission } from '../../submissions/entities/submission.entity';

@Entity('assignments')
export class Assignment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    class_id: string;

    @Column({ type: 'uuid' })
    created_by: string;

    @Column({ type: 'varchar' })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ type: 'timestamp', nullable: true })
    due_date: Date | null;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @OneToMany(() => Submission, (s) => s.assignment)
    submissions: Submission[];
}
