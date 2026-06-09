import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from '../../questions/entities/question.entity';

@Entity('answers')
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  question_id: number;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean' })
  is_correct: boolean;
}
