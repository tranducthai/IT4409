import { IsDateString, IsInt, IsNumber } from 'class-validator';

export class CreateQuizAttemptDto {
  @IsInt()
  quiz_id: number;

  @IsInt()
  student_id: number;

  @IsNumber()
  score: number;

  @IsDateString()
  started_at: string;

  @IsDateString()
  submitted_at: string;
}
