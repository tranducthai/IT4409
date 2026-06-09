import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateAnswerDto {
  @IsOptional()
  @IsInt()
  question_id?: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  is_correct?: boolean;
}
