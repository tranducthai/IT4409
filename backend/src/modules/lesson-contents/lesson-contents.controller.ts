import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Redirect,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { buildFileUrl, createDiskStorage } from '../../common/utils/upload.util';
import { CreateLessonContentDto } from './dtos/create-lesson-content.dto';
import { CreateManyLessonContentsDto } from './dtos/create-many-lesson-contents.dto';
import { UpdateLessonContentDto } from './dtos/update-lesson-content.dto';
import { LessonContentsService } from './lesson-contents.service';

@Controller('lesson-contents')
export class LessonContentsController {
  constructor(private readonly lessonContentsService: LessonContentsService) { }

  @Post()
  create(@Body() dto: CreateLessonContentDto) {
    return this.lessonContentsService.create(dto);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createDiskStorage('lesson-contents'),
    }),
  )
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return {
      file_url: buildFileUrl('lesson-contents', file.filename),
      original_name: file.originalname,
      file_name: file.filename,
      mime_type: file.mimetype,
      size: file.size,
    };
  }

  @Post('bulk')
  createMany(@Body() dto: CreateManyLessonContentsDto) {
    return this.lessonContentsService.createMany(dto);
  }

  @Get()
  findAll() {
    return this.lessonContentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lessonContentsService.findOne(id);
  }

  @Get(':id/open')
  @Redirect(undefined, 302)
  async open(@Param('id', ParseIntPipe) id: number) {
    const url = await this.lessonContentsService.getOpenRedirectUrl(id);
    return { url };
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
