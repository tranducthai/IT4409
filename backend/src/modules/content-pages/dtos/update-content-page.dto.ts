import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateContentPageDto {
  @IsOptional()
  @IsUUID()
  content_id?: string;

  @IsOptional()
  @IsString()
  video_url?: string;

  @IsOptional()
  @IsString()
  document_url?: string;

  @IsOptional()
  @IsUUID()
  quiz_id?: string;
}
