import { IsEnum, IsInt, IsString } from 'class-validator';
import { QuestionType } from '../enums/question-type.enum';

export class CreateQuestionDto {
  @IsInt()
  quiz_id: number;

  @IsString()
  content: string;

  @IsEnum(QuestionType)
  type: QuestionType;
}
