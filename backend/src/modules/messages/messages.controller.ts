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
import { CreateMessageDto } from './dtos/create-message.dto';
import { UpdateMessageDto } from './dtos/update-message.dto';
import { MessagesService } from './messages.service';

type AuthedRequest = Request & { user: JwtPayload };

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Post()
    create(@Req() req: AuthedRequest, @Body() dto: CreateMessageDto) {
        return this.messagesService.create(req.user.sub, dto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Get('discussion/:discussionId')
    findByDiscussion(
        @Req() req: AuthedRequest,
        @Param('discussionId', ParseUUIDPipe) discussionId: string,
    ) {
        return this.messagesService.findByDiscussionId(discussionId, req.user.sub);
    }

    @Get()
    findAll() {
        return this.messagesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.messagesService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Patch(':id')
    update(
        @Req() req: AuthedRequest,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateMessageDto,
    ) {
        return this.messagesService.update(req.user.sub, id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Delete(':id')
    remove(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string) {
        return this.messagesService.remove(req.user.sub, id);
    }
}
