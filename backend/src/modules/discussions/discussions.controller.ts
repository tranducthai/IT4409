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
import { DiscussionsService } from './discussions.service';
import { CreateDiscussionDto } from './dtos/create-discussion.dto';
import { UpdateDiscussionDto } from './dtos/update-discussion.dto';

@Controller('discussions')
export class DiscussionsController {
    constructor(private readonly discussionsService: DiscussionsService) { }

    @Post()
    create(@Body() dto: CreateDiscussionDto) {
        return this.discussionsService.create(dto);
    }

    @Get()
    findAll() {
        return this.discussionsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.discussionsService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateDiscussionDto,
    ) {
        return this.discussionsService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.discussionsService.remove(id);
    }
}
