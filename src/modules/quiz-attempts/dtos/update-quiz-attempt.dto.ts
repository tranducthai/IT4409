import { IsDateString, IsInt, IsNumber, IsOptional } from 'class-validator';

export class UpdateQuizAttemptDto {
  @IsOptional()
  @IsInt()
  quiz_id?: number;

  @IsOptional()
  @IsInt()
  student_id?: number;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsDateString()
  started_at?: string;

  @IsOptional()
  @IsDateString()
  submitted_at?: string;
}
