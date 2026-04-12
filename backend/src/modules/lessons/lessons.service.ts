import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLessonDto } from './dtos/create-lesson.dto';
import { UpdateLessonDto } from './dtos/update-lesson.dto';
import { LessonsRepository } from './repositories/lessons.repository';

@Injectable()
export class LessonsService {
  constructor(private readonly lessonsRepository: LessonsRepository) {}

  create(dto: CreateLessonDto) {
    return this.lessonsRepository.createOne(dto);
  }

  findAll() {
    return this.lessonsRepository.findAll();
  }

  async findOne(id: number) {
    const item = await this.lessonsRepository.findById(id);
    if (!item) throw new NotFoundException('Lesson not found');
    return item;
  }

  async update(id: number, dto: UpdateLessonDto) {
    const existing = await this.lessonsRepository.findById(id);
    if (!existing) throw new NotFoundException('Lesson not found');
    return this.lessonsRepository.updateOne(id, dto);
  }

  async remove(id: number) {
    const existing = await this.lessonsRepository.findById(id);
    if (!existing) throw new NotFoundException('Lesson not found');
    await this.lessonsRepository.removeOne(id);
    return { deleted: true };
  }
}
