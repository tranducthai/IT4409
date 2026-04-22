import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateSectionDto } from './create-section.dto';

export class CreateManySectionsDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateSectionDto)
    items: CreateSectionDto[];
}
