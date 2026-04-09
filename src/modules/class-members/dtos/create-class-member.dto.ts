import { IsDateString, IsEnum, IsInt } from 'class-validator';
import { ClassMemberRole } from '../enums/class-member-role.enum';
import { ClassMemberStatus } from '../enums/class-member-status.enum';

export class CreateClassMemberDto {
  @IsInt()
  class_id: number;

  @IsInt()
  user_id: number;

  @IsEnum(ClassMemberRole)
  role: ClassMemberRole;

  @IsEnum(ClassMemberStatus)
  status: ClassMemberStatus;

  @IsDateString()
  joined_at: string;
}
