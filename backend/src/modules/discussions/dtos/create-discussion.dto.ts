import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDiscussionDto {
    @IsUUID()
    class_id: string;

    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    content?: string;
}
