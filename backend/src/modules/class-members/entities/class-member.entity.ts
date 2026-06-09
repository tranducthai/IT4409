import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClassMemberRole } from '../enums/class-member-role.enum';
import { ClassMemberStatus } from '../enums/class-member-status.enum';
import { Class } from '../../classes/entities/class.entity';
import { User } from '../../users/entities/user.entity';

@Entity('class_members')
@Index(['class_id', 'user_id'], { unique: true })
export class ClassMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  class_id: string;

  @ManyToOne(() => Class, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: ClassMemberRole })
  role: ClassMemberRole;

  @Column({ type: 'enum', enum: ClassMemberStatus })
  status: ClassMemberStatus;

  @CreateDateColumn({ type: 'timestamp' })
  joined_at: Date;
}
