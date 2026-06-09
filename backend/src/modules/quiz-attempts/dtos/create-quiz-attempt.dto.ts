import { IsDateString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateQuizAttemptDto {
  @IsUUID()
  quiz_id: string;

  @IsUUID()
  student_id: string;

  @IsOptional()
  @IsDateString()
  start_time?: string;

  @IsOptional()
  @IsDateString()
  end_time?: string;

  @IsOptional()
  @IsNumber()
  score?: number;
}
