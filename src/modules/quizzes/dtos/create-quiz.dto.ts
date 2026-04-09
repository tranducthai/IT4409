import { IsInt, IsString } from 'class-validator';

export class CreateQuizDto {
  @IsInt()
  lesson_id: number;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsInt()
  time_limit: number;
}
