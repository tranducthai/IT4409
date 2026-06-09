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
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateQuizDto } from './dtos/create-quiz.dto';
import { UpdateQuizDto } from './dtos/update-quiz.dto';
import { QuizzesService } from './quizzes.service';

type AuthedRequest = Request & { user: JwtPayload };

@ApiTags('quizzes')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post()
  create(@Req() req: AuthedRequest, @Body() dto: CreateQuizDto) {
    if (req.user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('Teacher role required');
    }
    return this.quizzesService.create(req.user.sub, dto);
  }

  @Get()
  findAll() {
    return this.quizzesService.findAll();
  }

  @Get('class/:classId')
  findByClass(@Param('classId', ParseUUIDPipe) classId: string) {
    return this.quizzesService.findByClassId(classId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.quizzesService.findOne(id);
  }

  @Get(':id/open')
  @Redirect(undefined, 302)
  open(@Param('id', ParseUUIDPipe) id: string) {
    return { url: `/api/quiz/${id}` };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch(':id')
  update(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuizDto,
  ) {
    if (req.user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('Teacher role required');
    }
    return this.quizzesService.update(req.user.sub, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Delete(':id')
  remove(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string) {
    if (req.user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('Teacher role required');
    }
    return this.quizzesService.remove(req.user.sub, id);
  }
}
