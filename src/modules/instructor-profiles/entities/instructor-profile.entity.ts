import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Gender } from '../enums/gender.enum';

@Entity('instructor_profiles')
export class InstructorProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  user_id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', unique: true })
  instructor_code: string;

  @Column({ type: 'date' })
  date_of_birth: Date;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ type: 'varchar' })
  university: string;

  @Column({ type: 'varchar' })
  major: string;

  @Column({ type: 'varchar' })
  degree: string;

  @Column({ type: 'int' })
  experience_years: number;

  @Column({ type: 'text' })
  bio: string;
}
