import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Quiz } from '../../quizzes/entities/quiz.entity';
import { QuestionType } from '../enums/question-type.enum';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  quiz_id: number;

  @ManyToOne(() => Quiz, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: QuestionType })
  type: QuestionType;
}
