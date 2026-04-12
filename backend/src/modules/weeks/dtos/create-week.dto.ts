import { IsInt, IsString, IsUUID } from 'class-validator';

export class CreateWeekDto {
  @IsUUID()
  class_id: string;

  @IsString()
  title: string;

  @IsInt()
  week_number: number;
}
