import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ClassType } from '../enums/class-type.enum';

export class UpdateClassDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ClassType)
  type?: ClassType;

  @IsOptional()
  @IsInt()
  instructor_id?: number;
}
