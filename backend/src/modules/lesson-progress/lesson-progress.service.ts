import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from '../classes/entities/class.entity';
import { ClassMemberStatus } from '../class-members/enums/class-member-status.enum';
import { ClassMember } from '../class-members/entities/class-member.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { LessonProgress } from './entities/lesson-progress.entity';

@Injectable()
export class LessonProgressService {
  constructor(
    @InjectRepository(LessonProgress)
    private readonly lessonProgressRepository: Repository<LessonProgress>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(ClassMember)
    private readonly classMemberRepository: Repository<ClassMember>,
  ) {}

  private async ensureStudentAccess(
    classId: string,
    userId: string,
    role: string,
  ) {
    if (role !== 'STUDENT') {
      throw new ForbiddenException('Student role required');
    }

    const cls = await this.classRepository.findOne({ where: { id: classId } });
    if (!cls) throw new NotFoundException('Class not found');

    const member = await this.classMemberRepository.findOne({
      where: {
        class_id: classId,
        user_id: userId,
      },
    });

    if (!member || member.status !== ClassMemberStatus.Active) {
      throw new ForbiddenException(
        'You are not an active member of this class',
      );
    }

    return cls;
  }

  private async findLessonWithClass(lessonId: number) {
    const lesson = await this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.section', 'section')
      .leftJoinAndSelect('section.class', 'courseClass')
      .where('lesson.id = :lessonId', { lessonId })
      .getOne();

    if (!lesson || !lesson.section?.class) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async markCompleted(lessonId: number, userId: string, role: string) {
    const lesson = await this.findLessonWithClass(lessonId);
    await this.ensureStudentAccess(lesson.section.class.id, userId, role);

    const existing = await this.lessonProgressRepository.findOne({
      where: {
        class_id: lesson.section.class.id,
        lesson_id: lessonId,
        user_id: userId,
      },
    });

    if (existing) {
      return {
        lesson_id: existing.lesson_id,
        class_id: existing.class_id,
        user_id: existing.user_id,
        completed_at: existing.completed_at,
        completed: true,
      };
    }

    const created = await this.lessonProgressRepository.save(
      this.lessonProgressRepository.create({
        class_id: lesson.section.class.id,
        lesson_id: lessonId,
        user_id: userId,
      }),
    );

    return {
      lesson_id: created.lesson_id,
      class_id: created.class_id,
      user_id: created.user_id,
      completed_at: created.completed_at,
      completed: true,
    };
  }

  async getMyClassProgress(classId: string, userId: string, role: string) {
    const cls = await this.ensureStudentAccess(classId, userId, role);

    const lessons = await this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoin('lesson.section', 'section')
      .leftJoin('section.class', 'courseClass')
      .where('courseClass.id = :classId', { classId })
      .orderBy('section.order_index', 'ASC')
      .addOrderBy('lesson.order_index', 'ASC')
      .getMany();

    const progressRows = await this.lessonProgressRepository.find({
      where: {
        class_id: classId,
        user_id: userId,
      },
      order: {
        completed_at: 'ASC',
      },
    });

    const completedLessonIds = progressRows.map((row) => row.lesson_id);
    const completedSet = new Set(completedLessonIds);
    const totalLessons = lessons.length;
    const completed = completedLessonIds.length;
    const inProgress = totalLessons > completed ? 1 : 0;
    const todo = Math.max(0, totalLessons - completed - inProgress);
    const progressPercent =
      totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

    return {
      class_id: cls.id,
      total_lessons: totalLessons,
      completed,
      in_progress: inProgress,
      todo,
      progress_percent: progressPercent,
      completed_lesson_ids: Array.from(completedSet),
    };
  }
}
