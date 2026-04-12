import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateSectionDto {
  @IsOptional()
  @IsInt()
  class_id?: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsInt()
  order_index?: number;
}
