import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { LessonContentType } from '../enums/lesson-content-type.enum';

export class CreateLessonContentDto {
  @IsInt()
  lesson_id: number;

  @IsEnum(LessonContentType)
  type: LessonContentType;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  file_url?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsInt()
  duration?: number;

  @IsInt()
  order_index: number;
}
