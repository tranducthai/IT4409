import { IsInt } from 'class-validator';

export class CreateQuizAnswerDto {
  @IsInt()
  attempt_id: number;

  @IsInt()
  question_id: number;

  @IsInt()
  answer_id: number;
}
