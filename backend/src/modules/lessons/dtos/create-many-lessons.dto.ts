import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateLessonDto } from './create-lesson.dto';

export class CreateManyLessonsDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateLessonDto)
    items: CreateLessonDto[];
}
