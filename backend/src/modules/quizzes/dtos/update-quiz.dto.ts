import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateQuizDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  time_limit?: number;

  @IsOptional()
  @IsInt()
  total_questions?: number;

  @IsOptional()
  @IsUUID()
  class_id?: string;

  @IsOptional()
  @IsBoolean()
  is_random?: boolean;
}
