import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateDiscussionDto {
    @IsOptional()
    @IsUUID()
    class_id?: string;

    @IsOptional()
    @IsUUID()
    created_by?: string;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;
}
