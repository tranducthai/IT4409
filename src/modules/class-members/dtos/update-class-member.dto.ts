import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { ClassMemberRole } from '../enums/class-member-role.enum';
import { ClassMemberStatus } from '../enums/class-member-status.enum';

export class UpdateClassMemberDto {
  @IsOptional()
  @IsInt()
  class_id?: number;

  @IsOptional()
  @IsInt()
  user_id?: number;

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
