import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { LessonContentType } from '../enums/lesson-content-type.enum';

export class UpdateLessonContentDto {
  @IsOptional()
  @IsInt()
  lesson_id?: number;

  @IsOptional()
  @IsEnum(LessonContentType)
  type?: LessonContentType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  file_url?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsInt()
  duration?: number;

  @IsOptional()
  @IsInt()
  order_index?: number;
}
