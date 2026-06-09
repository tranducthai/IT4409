import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateWeekDto {
  @IsOptional()
  @IsUUID()
  class_id?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsInt()
  week_number?: number;
}
