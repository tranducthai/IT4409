import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateSectionDto {
  @IsOptional()
  @IsUUID()
  class_id?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsInt()
  order_index?: number;
}
