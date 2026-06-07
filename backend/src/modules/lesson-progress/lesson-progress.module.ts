import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from '../classes/entities/class.entity';
import { ClassMember } from '../class-members/entities/class-member.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { LessonProgress } from './entities/lesson-progress.entity';
import { LessonProgressService } from './lesson-progress.service';

@Module({
  imports: [TypeOrmModule.forFeature([LessonProgress, Lesson, Class, ClassMember])],
  providers: [LessonProgressService],
  exports: [LessonProgressService],
})
export class LessonProgressModule {}
