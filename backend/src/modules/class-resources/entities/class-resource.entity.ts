import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Class } from '../../classes/entities/class.entity';
import { User } from '../../users/entities/user.entity';
import { ClassResourceFolder } from './class-resource-folder.entity';

@Entity('class_resources')
export class ClassResource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  class_id: string;

  @ManyToOne(() => Class, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @Column({ type: 'uuid', nullable: true })
  folder_id: string | null;

  @ManyToOne(() => ClassResourceFolder, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'folder_id' })
  folder: ClassResourceFolder | null;

  @Column({ type: 'uuid' })
  uploaded_by: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;

  @Column({ type: 'varchar' })
  file_url: string;

  @Column({ type: 'varchar' })
  original_name: string;

  @Column({ type: 'varchar' })
  file_name: string;

  @Column({ type: 'varchar' })
  mime_type: string;

  @Column({ type: 'integer' })
  size: number;

  @Column({ type: 'integer', default: 1 })
  order_index: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
