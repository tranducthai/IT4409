import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ClassType } from '../enums/class-type.enum';

export class CreateClassDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsEnum(ClassType)
  type: ClassType;

  @IsUUID()
  teacher_id: string;

  @IsString()
  join_code: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
