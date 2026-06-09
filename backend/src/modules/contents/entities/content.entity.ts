import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Week } from '../../weeks/entities/week.entity';
import { ContentPage } from '../../content-pages/entities/content-page.entity';
import { ContentType } from '../enums/content-type.enum';

@Entity('contents')
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  week_id: string;

  @ManyToOne(() => Week, (w) => w.contents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'week_id' })
  week: Week;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'enum', enum: ContentType })
  type: ContentType;

  @Column({ type: 'int' })
  order_index: number;

  @OneToOne(() => ContentPage, (p) => p.content)
  page?: ContentPage;
}
