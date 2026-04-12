import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from '../../questions/entities/question.entity';
import { QuizAttempt } from '../../quiz-attempts/entities/quiz-attempt.entity';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int' })
  time_limit: number;

  @Column({ type: 'int' })
  total_questions: number;

  @Column({ type: 'uuid' })
  created_by: string;

  @Column({ type: 'boolean', default: false })
  is_random: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => Question, (q) => q.quiz)
  questions: Question[];

  @OneToMany(() => QuizAttempt, (a) => a.quiz)
  attempts: QuizAttempt[];
}
