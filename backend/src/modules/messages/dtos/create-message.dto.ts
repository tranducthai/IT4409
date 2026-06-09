import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMessageDto {
    @IsUUID()
    discussion_id: string;

    @IsString()
    content: string;

    @IsOptional()
    @IsString()
    image_url?: string;
}
