import { IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { ContentType } from '../enums/content-type.enum';

export class UpdateContentDto {
  @IsOptional()
  @IsUUID()
  week_id?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(ContentType)
  type?: ContentType;

  @IsOptional()
  @IsInt()
  order_index?: number;
}
