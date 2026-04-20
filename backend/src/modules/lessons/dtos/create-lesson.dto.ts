import { IsInt, IsString } from 'class-validator';

export class CreateLessonDto {
  @IsInt()
  section_id: number;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsInt()
  order_index: number;
}
