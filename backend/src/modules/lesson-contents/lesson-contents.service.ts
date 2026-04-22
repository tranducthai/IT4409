import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLessonContentDto } from './dtos/create-lesson-content.dto';
import { CreateManyLessonContentsDto } from './dtos/create-many-lesson-contents.dto';
import { UpdateLessonContentDto } from './dtos/update-lesson-content.dto';
import { LessonContent } from './entities/lesson-content.entity';
import { LessonContentType } from './enums/lesson-content-type.enum';
import { LessonContentsRepository } from './repositories/lesson-contents.repository';

@Injectable()
export class LessonContentsService {
  constructor(
    private readonly lessonContentsRepository: LessonContentsRepository,
  ) { }

  create(dto: CreateLessonContentDto) {
    return this.lessonContentsRepository.createOne(dto);
  }

  async createMany(dto: CreateManyLessonContentsDto) {
    const items = await this.lessonContentsRepository.createMany(dto.items);
    return items.map((i) => this.toResponse(i));
  }

  private toResponse(item: LessonContent) {
    return {
      ...item,
      open_url: `/api/lesson-contents/${item.id}/open`,
    };
  }

  async findAll() {
    const items = await this.lessonContentsRepository.findAll();
    return items.map((i) => this.toResponse(i));
  }

  async findOne(id: number) {
    const item = await this.lessonContentsRepository.findById(id);
    if (!item) throw new NotFoundException('LessonContent not found');
    return this.toResponse(item);
  }

  async getOpenRedirectUrl(id: number): Promise<string> {
    const item = await this.lessonContentsRepository.findById(id);
    if (!item) throw new NotFoundException('LessonContent not found');

    if (
      item.type === LessonContentType.Video ||
      item.type === LessonContentType.File
    ) {
      if (!item.file_url) throw new NotFoundException('File URL not found');
      return item.file_url;
    }

    if (item.type === LessonContentType.Quiz) {
      throw new NotFoundException(
        'LessonContent quiz redirect is no longer supported in the new schema',
      );
    }

    // Text content: keep user on the lesson content detail endpoint
    return `/api/lesson-contents/${item.id}`;
  }

  async update(id: number, dto: UpdateLessonContentDto) {
    const existing = await this.lessonContentsRepository.findById(id);
    if (!existing) throw new NotFoundException('LessonContent not found');
    return this.lessonContentsRepository.updateOne(id, dto);
  }

  async remove(id: number) {
    const existing = await this.lessonContentsRepository.findById(id);
    if (!existing) throw new NotFoundException('LessonContent not found');
    await this.lessonContentsRepository.removeOne(id);
    return { deleted: true };
  }
}
