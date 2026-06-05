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
import { Request } from 'express';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LessonProgressService } from '../lesson-progress/lesson-progress.service';
import { UserRole } from '../users/enums/user-role.enum';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dtos/create-class.dto';
import { UpdateClassDto } from './dtos/update-class.dto';

type AuthedRequest = Request & { user: JwtPayload };

@Controller('classes')
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    private readonly lessonProgressService: LessonProgressService,
  ) { }

  @Post()
  create(@Body() dto: CreateClassDto) {
    return this.classesService.create(dto);
  }

  @Get()
  findAll() {
    return this.classesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.classesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/teacher-progress')
  getTeacherProgress(
    @Req() req: AuthedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    if (req.user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('Teacher role required');
    }
    return this.classesService.getTeacherProgress(id, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/progress/me')
  getMyProgress(
    @Req() req: AuthedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.lessonProgressService.getMyClassProgress(
      id,
      req.user.sub,
      req.user.role,
    );
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateClassDto,
  ) {
    return this.classesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.classesService.remove(id);
  }
}
