import { Type } from 'class-transformer';
import { IsArray, IsIn, IsString, IsUUID, ValidateNested } from 'class-validator';

class QuestionItemDto {
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

export class CreateQuestionsBulkDto {
  @IsUUID()
  quiz_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionItemDto)
  questions: QuestionItemDto[];
}
