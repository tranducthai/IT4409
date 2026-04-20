import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateAssignmentDto {
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
    description?: string;

    @IsOptional()
    @IsDateString()
    due_date?: string;
}
