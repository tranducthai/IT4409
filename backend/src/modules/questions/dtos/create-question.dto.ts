import { IsIn, IsString, IsUUID } from 'class-validator';

export class CreateQuestionDto {
  @IsUUID()
  quiz_id: string;

  @IsString()
  question_text: string;

  @IsString()
  option_a: string;

  @IsString()
  option_b: string;

  @IsString()
  option_c: string;

  @IsString()
  option_d: string;

  @IsIn(['A', 'B', 'C', 'D'])
  correct_answer: string;
}
