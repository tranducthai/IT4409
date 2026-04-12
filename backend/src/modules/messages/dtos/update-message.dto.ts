import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateMessageDto {
    @IsOptional()
    @IsUUID()
    discussion_id?: string;

    @IsOptional()
    @IsUUID()
    user_id?: string;

    @IsOptional()
    @IsString()
    content?: string;
}
