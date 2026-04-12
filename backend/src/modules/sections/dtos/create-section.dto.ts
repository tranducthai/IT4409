import { IsInt, IsString } from 'class-validator';

export class CreateSectionDto {
  @IsInt()
  class_id: number;

  @IsString()
  title: string;

  @IsInt()
  order_index: number;
}
