import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LessonContentType } from '../../lesson-contents/enums/lesson-content-type.enum';
import { Section } from '../../sections/entities/section.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  section_id: number;

  @ManyToOne(() => Section, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'section_id' })
  section: Section;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: LessonContentType,
    enumName: 'lesson_contents_type_enum',
  })
  type: LessonContentType;

  @Column({ type: 'varchar', nullable: true })
  file_url: string | null;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'int', nullable: true })
  duration: number | null;

  @Column({ type: 'uuid', nullable: true })
  quiz_id: string | null;

  @Column({ type: 'int' })
  order_index: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
