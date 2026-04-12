import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dtos/create-assignment.dto';
import { UpdateAssignmentDto } from './dtos/update-assignment.dto';

@Controller('assignments')
export class AssignmentsController {
    constructor(private readonly assignmentsService: AssignmentsService) { }

    @Post()
    create(@Body() dto: CreateAssignmentDto) {
        return this.assignmentsService.create(dto);
    }

    @Get()
    findAll() {
        return this.assignmentsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.assignmentsService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateAssignmentDto,
    ) {
        return this.assignmentsService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.assignmentsService.remove(id);
    }
}
