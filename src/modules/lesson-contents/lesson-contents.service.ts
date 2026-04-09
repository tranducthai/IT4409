import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLessonContentDto } from './dtos/create-lesson-content.dto';
import { UpdateLessonContentDto } from './dtos/update-lesson-content.dto';
import { LessonContentsRepository } from './repositories/lesson-contents.repository';

@Injectable()
export class LessonContentsService {
  constructor(
    private readonly lessonContentsRepository: LessonContentsRepository,
  ) {}

  create(dto: CreateLessonContentDto) {
    return this.lessonContentsRepository.createOne(dto);
  }

  findAll() {
    return this.lessonContentsRepository.findAll();
  }

  async findOne(id: number) {
    const item = await this.lessonContentsRepository.findById(id);
    if (!item) throw new NotFoundException('LessonContent not found');
    return item;
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
