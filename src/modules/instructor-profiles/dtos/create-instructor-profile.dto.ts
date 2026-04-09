import { IsDateString, IsEnum, IsInt, IsString } from 'class-validator';
import { Gender } from '../enums/gender.enum';

export class CreateInstructorProfileDto {
  @IsInt()
  user_id: number;

  @IsString()
  instructor_code: string;

  @IsDateString()
  date_of_birth: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  university: string;

  @IsString()
  major: string;

  @IsString()
  degree: string;

  @IsInt()
  experience_years: number;

  @IsString()
  bio: string;
}
