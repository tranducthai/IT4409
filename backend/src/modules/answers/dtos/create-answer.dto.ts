import { IsBoolean, IsInt, IsString } from 'class-validator';

export class CreateAnswerDto {
  @IsInt()
  question_id: number;

  @IsString()
  content: string;

  @IsBoolean()
  is_correct: boolean;
}
