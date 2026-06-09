import { IsBoolean, IsIn, IsOptional, IsUUID } from 'class-validator';

export class UpdateQuizAnswerDto {
  @IsOptional()
  @IsUUID()
  attempt_id?: string;

  @IsOptional()
  @IsUUID()
  question_id?: string;

  @IsOptional()
  @IsIn(['A', 'B', 'C', 'D'])
  selected_answer?: 'A' | 'B' | 'C' | 'D';

  @IsOptional()
  @IsBoolean()
  is_correct?: boolean;
}
