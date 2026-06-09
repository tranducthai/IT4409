import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateStudentProfileDto {
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsString()
  student_code?: string;

  @IsOptional()
  @IsString()
  class_name?: string;

  @IsOptional()
  @IsString()
  major?: string;

  @IsOptional()
  @IsString()
  course_year?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  dob?: string;
}
