import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateInstructorProfileDto {
  @IsUUID()
  user_id: string;

  @IsString()
  specialization: string;

  @IsOptional()
  @IsString()
  degree?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
