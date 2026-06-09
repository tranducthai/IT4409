import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateSubmissionDto {
    @IsOptional()
    @IsUUID()
    assignment_id?: string;

    @IsOptional()
    @IsUUID()
    student_id?: string;

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
