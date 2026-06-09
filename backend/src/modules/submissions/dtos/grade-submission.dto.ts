import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GradeSubmissionDto {
    @IsOptional()
    @IsNumber()
    score?: number;

    @IsOptional()
    @IsString()
    feedback?: string;
}