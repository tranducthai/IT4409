import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateQuizDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  time_limit: number;

  @IsInt()
  total_questions: number;

  @IsUUID()
  created_by: string;

  @IsOptional()
  @IsBoolean()
  is_random?: boolean;
}
