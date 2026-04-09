import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Quiz } from '../../quizzes/entities/quiz.entity';
import { User } from '../../users/entities/user.entity';

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  quiz_id: number;

  @ManyToOne(() => Quiz, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @Column({ type: 'int' })
  student_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ type: 'float' })
  score: number;

  @Column({ type: 'timestamp' })
  started_at: Date;

  @Column({ type: 'timestamp' })
  submitted_at: Date;
}
