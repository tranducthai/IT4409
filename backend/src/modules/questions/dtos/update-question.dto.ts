import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateQuestionDto {
  @IsOptional()
  @IsUUID()
  quiz_id?: string;

  @IsOptional()
  @IsString()
  question_text?: string;

  @IsOptional()
  @IsString()
  option_a?: string;

  @IsOptional()
  @IsString()
  option_b?: string;

  @IsOptional()
  @IsString()
  option_c?: string;

  @IsOptional()
  @IsString()
  option_d?: string;

  @IsOptional()
  @IsIn(['A', 'B', 'C', 'D'])
  correct_answer?: string;
}
