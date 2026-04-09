import { IsEnum, IsInt, IsString } from 'class-validator';
import { ClassType } from '../enums/class-type.enum';

export class CreateClassDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(ClassType)
  type: ClassType;

  @IsInt()
  instructor_id: number;
}
