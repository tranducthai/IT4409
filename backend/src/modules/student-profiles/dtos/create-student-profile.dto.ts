import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateStudentProfileDto {
  @IsUUID()
  user_id: string;

  @IsString()
  student_code: string;

  @IsString()
  class_name: string;

  @IsString()
  major: string;

  @IsString()
  course_year: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  dob?: string;
}
