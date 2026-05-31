import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from '../classes/entities/class.entity';
import { ClassMember } from '../class-members/entities/class-member.entity';
import { ClassMemberStatus } from '../class-members/enums/class-member-status.enum';
import { CreateLessonContentDto } from './dtos/create-lesson-content.dto';
import { CreateManyLessonContentsDto } from './dtos/create-many-lesson-contents.dto';
import { UpdateLessonContentDto } from './dtos/update-lesson-content.dto';
import { LessonContentType } from './enums/lesson-content-type.enum';
import { LessonContentsRepository } from './repositories/lesson-contents.repository';
import { Lesson } from '../lessons/entities/lesson.entity';

@Injectable()
export class LessonContentsService {
  constructor(
    private readonly lessonContentsRepository: LessonContentsRepository,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(ClassMember)
    private readonly classMemberRepository: Repository<ClassMember>,
  ) { }

  create(dto: CreateLessonContentDto) {
    return this.lessonContentsRepository.createOne(dto);
  }

  async createMany(dto: CreateManyLessonContentsDto) {
    const items = await this.lessonContentsRepository.createMany(dto.items);
    return items.map((i) => this.toResponse(i));
  }

  private toResponse(item: Lesson) {
    return {
      id: item.id,
      lesson_id: item.id,
      type: item.type,
      title: item.title,
      file_url: item.file_url,
      content: item.content,
      duration: item.duration,
      order_index: item.order_index,
      quiz_id: item.quiz_id,
      open_url: `/api/lesson-contents/${item.id}/open`,
    };
  }

  private async ensureClassAccess(classId: string, userId: string, role: string) {
    const cls = await this.classRepository.findOne({ where: { id: classId } });
    if (!cls) throw new NotFoundException('Class not found');

    if (role === 'ADMIN' || cls.teacher_id === userId) {
      return cls;
    }

    const member = await this.classMemberRepository.findOne({
      where: {
        class_id: classId,
        user_id: userId,
      },
    });

    if (!member || member.status !== ClassMemberStatus.Active) {
      throw new ForbiddenException('You are not an active member of this class');
    }

    return cls;
  }

  async findByClassId(classId: string, userId: string, role: string) {
    await this.ensureClassAccess(classId, userId, role);
    const items = await this.lessonContentsRepository.findManyByClassId(classId);
    return items.map((i) => this.toResponse(i));
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
