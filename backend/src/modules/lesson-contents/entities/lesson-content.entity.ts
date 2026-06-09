import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { LessonContentType } from '../enums/lesson-content-type.enum';

@Entity('lesson_contents')
export class LessonContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  lesson_id: number;

  @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @Column({ type: 'enum', enum: LessonContentType })
  type: LessonContentType;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  file_url: string | null;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'int', nullable: true })
  duration: number | null;

  @Column({ type: 'int' })
  order_index: number;
}
