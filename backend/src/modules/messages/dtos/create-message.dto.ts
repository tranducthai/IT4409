import { IsString, IsUUID } from 'class-validator';

export class CreateMessageDto {
    @IsUUID()
    discussion_id: string;

    @IsUUID()
    user_id: string;

    @IsString()
    content: string;
}
