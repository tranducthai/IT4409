import { IsDateString, IsEnum, IsInt, IsString } from 'class-validator';
import { Gender } from '../enums/gender.enum';
import { StudentStatus } from '../enums/student-status.enum';

export class CreateStudentProfileDto {
  @IsInt()
  user_id: number;

  @IsString()
  student_code: string;

  @IsDateString()
  date_of_birth: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  school: string;

  @IsString()
  major: string;

  @IsInt()
  year: number;

  @IsString()
  batch: string;

  @IsEnum(StudentStatus)
  status: StudentStatus;
}
