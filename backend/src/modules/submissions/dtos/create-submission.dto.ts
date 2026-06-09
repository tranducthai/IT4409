import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSubmissionDto {
    @IsUUID()
    assignment_id: string;

    @IsUUID()
    student_id: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsString()
    file_url?: string;

    @IsOptional()
    @IsNumber()
    score?: number;

    @IsOptional()
    @IsString()
    feedback?: string;
}
