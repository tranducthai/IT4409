import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Gender } from '../enums/gender.enum';
import { StudentStatus } from '../enums/student-status.enum';

@Entity('student_profiles')
export class StudentProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  user_id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', unique: true })
  student_code: string;

  @Column({ type: 'date' })
  date_of_birth: Date;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ type: 'varchar' })
  school: string;

  @Column({ type: 'varchar' })
  major: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'varchar' })
  batch: string;

  @Column({ type: 'enum', enum: StudentStatus })
  status: StudentStatus;
}
