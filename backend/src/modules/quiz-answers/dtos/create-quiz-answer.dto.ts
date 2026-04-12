import { IsBoolean, IsIn, IsOptional, IsUUID } from 'class-validator';

export class CreateQuizAnswerDto {
  @IsUUID()
  attempt_id: string;

  @IsUUID()
  question_id: string;

  @IsIn(['A', 'B', 'C', 'D'])
  selected_answer: 'A' | 'B' | 'C' | 'D';

  @IsOptional()
  @IsBoolean()
  is_correct?: boolean;
}
