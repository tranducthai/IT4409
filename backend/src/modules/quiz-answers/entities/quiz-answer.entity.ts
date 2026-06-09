import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuizAttempt } from '../../quiz-attempts/entities/quiz-attempt.entity';
import { Question } from '../../questions/entities/question.entity';

@Entity('quiz_answers')
export class QuizAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  attempt_id: string;

  @ManyToOne(() => QuizAttempt, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attempt_id' })
  attempt: QuizAttempt;

  @Column({ type: 'uuid' })
  question_id: string;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ type: 'varchar' })
  selected_answer: string;

  @Column({ type: 'boolean' })
  is_correct: boolean;
}
