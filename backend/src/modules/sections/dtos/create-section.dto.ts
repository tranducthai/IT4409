import { IsInt, IsString, IsUUID } from 'class-validator';

export class CreateSectionDto {
  @IsUUID()
  class_id: string;

  @IsString()
  title: string;

  @IsInt()
  order_index: number;
}
