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
  Redirect,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { SupabaseStorageService } from '../../common/storage/supabase-storage.service';
import { createMemoryStorage, uploadToSupabaseStorage } from '../../common/utils/upload.util';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateLessonContentDto } from './dtos/create-lesson-content.dto';
import { CreateManyLessonContentsDto } from './dtos/create-many-lesson-contents.dto';
import { UpdateLessonContentDto } from './dtos/update-lesson-content.dto';
import { LessonContentsService } from './lesson-contents.service';

type AuthedRequest = Request & { user: JwtPayload };

@Controller('lesson-contents')
export class LessonContentsController {
  constructor(
    private readonly lessonContentsService: LessonContentsService,
    private readonly storageService: SupabaseStorageService,
  ) { }

  @Post()
  create(@Body() dto: CreateLessonContentDto) {
    return this.lessonContentsService.create(dto);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createMemoryStorage(),
    }),
  )
  async upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const { url, fileName } = await this.storageService.upload(
      'lesson-contents',
      file,
    );

    return {
      original_name: file.originalname,
      file_name: fileName,
      mime_type: file.mimetype,
      size: file.size,
    };
    return uploadToSupabaseStorage('lesson-contents', file);
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
