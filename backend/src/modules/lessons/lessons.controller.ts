import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateLessonDto } from './dtos/create-lesson.dto';
import { CreateManyLessonsDto } from './dtos/create-many-lessons.dto';
import { LessonProgressService } from '../lesson-progress/lesson-progress.service';
import { UpdateLessonDto } from './dtos/update-lesson.dto';
import { LessonsService } from './lessons.service';

type AuthedRequest = Request & { user: JwtPayload };

@Controller('lessons')
export class LessonsController {
  constructor(
    private readonly lessonsService: LessonsService,
    private readonly lessonProgressService: LessonProgressService,
  ) { }

  @Post()
  create(@Body() dto: CreateLessonDto) {
    return this.lessonsService.create(dto);
  }

  @Post('bulk')
  createMany(@Body() dto: CreateManyLessonsDto) {
    return this.lessonsService.createMany(dto);
  }

  @Get()
  findAll() {
    return this.lessonsService.findAll();
  }

  @Get('section/:sectionId')
  findBySection(@Param('sectionId', ParseIntPipe) sectionId: number) {
    return this.lessonsService.findBySectionId(sectionId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lessonsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':lessonId/progress/me')
  markCompleted(
    @Req() req: AuthedRequest,
    @Param('lessonId', ParseIntPipe) lessonId: number,
  ) {
    return this.lessonProgressService.markCompleted(
      lessonId,
      req.user.sub,
      req.user.role,
    );
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLessonDto) {
    return this.lessonsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lessonsService.remove(id);
  }
}
