import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { DiscussionsService } from './discussions.service';
import { CreateDiscussionDto } from './dtos/create-discussion.dto';
import { UpdateDiscussionDto } from './dtos/update-discussion.dto';

type AuthedRequest = Request & { user: JwtPayload };

@ApiTags('discussions')
@Controller('discussions')
export class DiscussionsController {
    constructor(private readonly discussionsService: DiscussionsService) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Post()
    create(@Req() req: AuthedRequest, @Body() dto: CreateDiscussionDto) {
        return this.discussionsService.create(req.user.sub, dto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Get('class/:classId')
    findByClass(
        @Req() req: AuthedRequest,
        @Param('classId', ParseUUIDPipe) classId: string,
    ) {
        return this.discussionsService.findByClassId(classId, req.user.sub);
    }

    @Get()
    findAll() {
        return this.discussionsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.discussionsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Patch(':id')
    update(
        @Req() req: AuthedRequest,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateDiscussionDto,
    ) {
        return this.discussionsService.update(req.user.sub, id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Delete(':id')
    remove(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string) {
        return this.discussionsService.remove(req.user.sub, id);
    }
}
