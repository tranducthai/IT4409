import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { Gender } from '../enums/gender.enum';

export class UpdateInstructorProfileDto {
  @IsOptional()
  @IsInt()
  user_id?: number;

  @IsOptional()
  @IsString()
  instructor_code?: string;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  university?: string;

  @IsOptional()
  @IsString()
  major?: string;

  @IsOptional()
  @IsString()
  degree?: string;

  @IsOptional()
  @IsInt()
  experience_years?: number;

  @IsOptional()
  @IsString()
  bio?: string;
}
