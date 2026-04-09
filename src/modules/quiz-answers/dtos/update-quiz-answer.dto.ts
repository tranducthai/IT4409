import { IsInt, IsOptional } from 'class-validator';

export class UpdateQuizAnswerDto {
  @IsOptional()
  @IsInt()
  attempt_id?: number;

  @IsOptional()
  @IsInt()
  question_id?: number;

  @IsOptional()
  @IsInt()
  answer_id?: number;
}
