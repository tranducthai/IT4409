import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ClassesRepository } from '../classes/repositories/classes.repository';
import { CreateQuizDto } from './dtos/create-quiz.dto';
import { UpdateQuizDto } from './dtos/update-quiz.dto';
import { QuizzesRepository } from './repositories/quizzes.repository';

@Injectable()
export class QuizzesService {
  constructor(
    private readonly quizzesRepository: QuizzesRepository,
    private readonly classesRepository: ClassesRepository,
  ) { }

  async create(teacherId: string, dto: CreateQuizDto) {
    const cls = await this.classesRepository.findById(dto.class_id);
    if (!cls) throw new NotFoundException('Class not found');
    if (cls.teacher_id !== teacherId) {
      throw new ForbiddenException('Class not owned by teacher');
    }

    return this.quizzesRepository.createOne({
      ...dto,
      created_by: teacherId,
      open_time: dto.open_time ? new Date(dto.open_time) : null,
      close_time: dto.close_time ? new Date(dto.close_time) : null,
    });
  }

  findAll() {
    return this.quizzesRepository.findAll();
  }

  findByClassId(classId: string) {
    return this.quizzesRepository.findByClassId(classId);
  }

  async findOne(id: string) {
    const item = await this.quizzesRepository.findById(id);
    if (!item) throw new NotFoundException('Quiz not found');
    return item;
  }

  async update(teacherId: string, id: string, dto: UpdateQuizDto) {
    const existing = await this.quizzesRepository.findById(id);
    if (!existing) throw new NotFoundException('Quiz not found');

    const clsId = dto.class_id ?? existing.class_id;
    const cls = await this.classesRepository.findById(clsId);
    if (!cls) throw new NotFoundException('Class not found');
    if (cls.teacher_id !== teacherId) {
      throw new ForbiddenException('Class not owned by teacher');
    }

    const { open_time, close_time, ...rest } = dto;
    const updatePayload = {
      ...rest,
      ...(open_time !== undefined ? { open_time: open_time ? new Date(open_time) : null } : {}),
      ...(close_time !== undefined ? { close_time: close_time ? new Date(close_time) : null } : {}),
    };
    return this.quizzesRepository.updateOne(id, updatePayload);
  }

  async remove(teacherId: string, id: string) {
    const existing = await this.quizzesRepository.findById(id);
    if (!existing) throw new NotFoundException('Quiz not found');
    const cls = await this.classesRepository.findById(existing.class_id);
    if (!cls) throw new NotFoundException('Class not found');
    if (cls.teacher_id !== teacherId) {
      throw new ForbiddenException('Class not owned by teacher');
    }
    await this.quizzesRepository.removeOne(id);
    return { deleted: true };
  }
}
