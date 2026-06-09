import { IsDateString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class UpdateQuizAttemptDto {
  @IsOptional()
  @IsUUID()
  quiz_id?: string;

  @IsOptional()
  @IsUUID()
  student_id?: string;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsDateString()
  start_time?: string;

  @IsOptional()
  @IsDateString()
  end_time?: string;
}
