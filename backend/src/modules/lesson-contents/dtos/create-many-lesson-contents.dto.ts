import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateLessonContentDto } from './create-lesson-content.dto';

export class CreateManyLessonContentsDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateLessonContentDto)
    items: CreateLessonContentDto[];
}
