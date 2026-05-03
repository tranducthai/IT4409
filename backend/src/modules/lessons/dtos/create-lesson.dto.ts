import { IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { LessonContentType } from '../../lesson-contents/enums/lesson-content-type.enum';

export class CreateLessonDto {
  @IsInt()
  section_id: number;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(LessonContentType)
  type: LessonContentType;

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

  @IsInt()
  order_index: number;
}
