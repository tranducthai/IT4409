import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { Gender } from '../enums/gender.enum';
import { StudentStatus } from '../enums/student-status.enum';

export class UpdateStudentProfileDto {
  @IsOptional()
  @IsInt()
  user_id?: number;

  @IsOptional()
  @IsString()
  student_code?: string;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  school?: string;

  @IsOptional()
  @IsString()
  major?: string;

  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  @IsString()
  batch?: string;

  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;
}
