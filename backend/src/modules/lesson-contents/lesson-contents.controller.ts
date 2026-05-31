import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  Redirect,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { buildFileUrl, createDiskStorage } from '../../common/utils/upload.util';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateLessonContentDto } from './dtos/create-lesson-content.dto';
import { CreateManyLessonContentsDto } from './dtos/create-many-lesson-contents.dto';
import { UpdateLessonContentDto } from './dtos/update-lesson-content.dto';
import { LessonContentsService } from './lesson-contents.service';

type AuthedRequest = Request & { user: JwtPayload };

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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('class/:classId')
  findByClass(
    @Req() req: AuthedRequest,
    @Param('classId', new ParseUUIDPipe()) classId: string,
  ) {
    return this.lessonContentsService.findByClassId(
      classId,
      req.user.sub,
      req.user.role,
    );
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
