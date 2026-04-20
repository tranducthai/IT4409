import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAssignmentDto {
    @IsUUID()
    class_id: string;

    @IsUUID()
    created_by: string;

    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsDateString()
    due_date?: string;
}
