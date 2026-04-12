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
import { CreateSubmissionDto } from './dtos/create-submission.dto';
import { UpdateSubmissionDto } from './dtos/update-submission.dto';
import { SubmissionsService } from './submissions.service';

@Controller('submissions')
export class SubmissionsController {
    constructor(private readonly submissionsService: SubmissionsService) { }

    @Post()
    create(@Body() dto: CreateSubmissionDto) {
        return this.submissionsService.create(dto);
    }

    @Get()
    findAll() {
        return this.submissionsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.submissionsService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateSubmissionDto,
    ) {
        return this.submissionsService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.submissionsService.remove(id);
    }
}
