import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateQuestionDto } from './dtos/create-question.dto';
import { CreateQuestionsBulkDto } from './dtos/create-questions-bulk.dto';
import { UpdateQuestionDto } from './dtos/update-question.dto';
import { QuestionsService } from './questions.service';

type AuthedRequest = Request & { user: JwtPayload };

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post()
  create(@Req() req: AuthedRequest, @Body() dto: CreateQuestionDto) {
    if (req.user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('Teacher role required');
    }
    return this.questionsService.create(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('bulk')
  createBulk(@Req() req: AuthedRequest, @Body() dto: CreateQuestionsBulkDto) {
    if (req.user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('Teacher role required');
    }
    return this.questionsService.createMany(req.user.sub, dto);
  }

  @Get()
  findAll() {
    return this.questionsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('quiz/:quizId')
  findByQuiz(
    @Req() req: AuthedRequest,
    @Param('quizId', ParseUUIDPipe) quizId: string,
  ) {
    if (req.user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('Teacher role required');
    }
    return this.questionsService.findByQuizId(req.user.sub, quizId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch(':id')
  update(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    if (req.user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('Teacher role required');
    }
    return this.questionsService.update(req.user.sub, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Delete(':id')
  remove(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string) {
    if (req.user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('Teacher role required');
    }
    return this.questionsService.remove(req.user.sub, id);
  }
}
