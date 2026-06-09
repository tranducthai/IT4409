import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuizAnswer } from '../../quiz-answers/entities/quiz-answer.entity';
import { Quiz } from '../../quizzes/entities/quiz.entity';
import { User } from '../../users/entities/user.entity';

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  quiz_id: string;

  @ManyToOne(() => Quiz, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @Column({ type: 'uuid' })
  student_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @CreateDateColumn({ type: 'timestamp' })
  start_time: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_time: Date | null;

  @Column({ type: 'float', nullable: true })
  score: number | null;

  @OneToMany(() => QuizAnswer, (a) => a.attempt)
  answers: QuizAnswer[];
}
