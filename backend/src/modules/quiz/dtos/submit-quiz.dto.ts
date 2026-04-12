import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class SubmitQuizAnswerDto {
  @IsUUID()
  question_id: string;

  @IsIn(['A', 'B', 'C', 'D'])
  selected_answer: 'A' | 'B' | 'C' | 'D';
}

export class SubmitQuizDto {
  @IsUUID()
  attempt_id: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubmitQuizAnswerDto)
  answers: SubmitQuizAnswerDto[];
}
