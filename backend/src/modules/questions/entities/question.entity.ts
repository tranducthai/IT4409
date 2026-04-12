import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Quiz } from '../../quizzes/entities/quiz.entity';
import { QuizAnswer } from '../../quiz-answers/entities/quiz-answer.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  quiz_id: string;

  @ManyToOne(() => Quiz, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @Column({ type: 'text' })
  question_text: string;

  @Column({ type: 'text' })
  option_a: string;

  @Column({ type: 'text' })
  option_b: string;

  @Column({ type: 'text' })
  option_c: string;

  @Column({ type: 'text' })
  option_d: string;

  @Column({ type: 'varchar' })
  correct_answer: string;

  @OneToMany(() => QuizAnswer, (a) => a.question)
  answers: QuizAnswer[];
}
