import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Class } from '../../classes/entities/class.entity';
import { Content } from '../../contents/entities/content.entity';

@Entity('weeks')
export class Week {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  class_id: string;

  @ManyToOne(() => Class, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'int' })
  week_number: number;

  @OneToMany(() => Content, (c) => c.week)
  contents: Content[];
}
