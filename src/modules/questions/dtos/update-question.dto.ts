import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { QuestionType } from '../enums/question-type.enum';

export class UpdateQuestionDto {
  @IsOptional()
  @IsInt()
  quiz_id?: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType;
}
