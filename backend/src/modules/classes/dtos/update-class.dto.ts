import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ClassType } from '../enums/class-type.enum';

export class UpdateClassDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsEnum(ClassType)
  type?: ClassType;

  @IsOptional()
  @IsUUID()
  teacher_id?: string;

  @IsOptional()
  @IsString()
  join_code?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
