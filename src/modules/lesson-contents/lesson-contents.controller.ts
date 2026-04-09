import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateLessonContentDto } from './dtos/create-lesson-content.dto';
import { UpdateLessonContentDto } from './dtos/update-lesson-content.dto';
import { LessonContentsService } from './lesson-contents.service';

@Controller('lesson-contents')
export class LessonContentsController {
  constructor(private readonly lessonContentsService: LessonContentsService) {}

  @Post()
  create(@Body() dto: CreateLessonContentDto) {
    return this.lessonContentsService.create(dto);
  }

  @Get()
  findAll() {
    return this.lessonContentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lessonContentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLessonContentDto,
  ) {
    return this.lessonContentsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lessonContentsService.remove(id);
  }
}
