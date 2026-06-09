import { IsEnum, IsInt, IsString, IsUUID } from 'class-validator';
import { ContentType } from '../enums/content-type.enum';

export class CreateContentDto {
  @IsUUID()
  week_id: string;

  @IsString()
  title: string;

  @IsEnum(ContentType)
  type: ContentType;

  @IsInt()
  order_index: number;
}
