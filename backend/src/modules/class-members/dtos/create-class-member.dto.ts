import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ClassMemberRole } from '../enums/class-member-role.enum';
import { ClassMemberStatus } from '../enums/class-member-status.enum';

export class CreateClassMemberDto {
  @IsUUID()
  class_id: string;

  @IsUUID()
  user_id: string;

  @IsEnum(ClassMemberRole)
  role: ClassMemberRole;

  @IsEnum(ClassMemberStatus)
  status: ClassMemberStatus;

  @IsOptional()
  @IsDateString()
  joined_at?: string;
}
