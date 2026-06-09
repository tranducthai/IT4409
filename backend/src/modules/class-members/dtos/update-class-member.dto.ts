import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ClassMemberRole } from '../enums/class-member-role.enum';
import { ClassMemberStatus } from '../enums/class-member-status.enum';

export class UpdateClassMemberDto {
  @IsOptional()
  @IsUUID()
  class_id?: string;

  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsEnum(ClassMemberRole)
  role?: ClassMemberRole;

  @IsOptional()
  @IsEnum(ClassMemberStatus)
  status?: ClassMemberStatus;

  @IsOptional()
  @IsDateString()
  joined_at?: string;
}
