import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Content } from '../../contents/entities/content.entity';

@Entity('content_pages')
export class ContentPage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  content_id: string;

  @OneToOne(() => Content, (c) => c.page, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'content_id' })
  content: Content;

  @Column({ type: 'text', nullable: true })
  video_url: string | null;

  @Column({ type: 'text', nullable: true })
  document_url: string | null;

  // wired as plain UUID for now; relation to Quiz will be added in quiz rebuild
  @Column({ type: 'uuid', nullable: true })
  quiz_id: string | null;
}
