import { IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { LessonContentType } from '../../lesson-contents/enums/lesson-content-type.enum';

export class UpdateLessonDto {
  @IsOptional()
  @IsInt()
  section_id?: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(LessonContentType)
  type?: LessonContentType;

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
  @IsUUID()
  quiz_id?: string;

  @IsOptional()
  @IsInt()
  order_index?: number;
}
