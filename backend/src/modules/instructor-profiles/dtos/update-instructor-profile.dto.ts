import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateInstructorProfileDto {
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  degree?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
