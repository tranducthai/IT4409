import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDiscussionDto {
    @IsUUID()
    class_id: string;

    @IsUUID()
    created_by: string;

    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    content?: string;
}
