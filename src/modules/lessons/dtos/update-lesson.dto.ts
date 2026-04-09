import { IsInt, IsOptional, IsString } from 'class-validator';

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
  @IsInt()
  order_index?: number;
}
