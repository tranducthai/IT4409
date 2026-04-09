import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuizAttempt } from '../../quiz-attempts/entities/quiz-attempt.entity';
import { Question } from '../../questions/entities/question.entity';
import { Answer } from '../../answers/entities/answer.entity';

@Entity('quiz_answers')
export class QuizAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  attempt_id: number;

  @ManyToOne(() => QuizAttempt, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attempt_id' })
  attempt: QuizAttempt;

  @Column({ type: 'int' })
  question_id: number;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ type: 'int' })
  answer_id: number;

  @ManyToOne(() => Answer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'answer_id' })
  answer: Answer;
}
