import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from '../classes/entities/class.entity';
import { ClassMember } from '../class-members/entities/class-member.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Section } from '../sections/entities/section.entity';
import { LessonContentsController } from './lesson-contents.controller';
import { LessonContentsService } from './lesson-contents.service';
import { LessonContentsRepository } from './repositories/lesson-contents.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lesson,
      Section,
      Class,
      ClassMember,
    ]),
  ],
  controllers: [LessonContentsController],
  providers: [LessonContentsService, LessonContentsRepository],
  exports: [LessonContentsService],
})
export class LessonContentsModule {}
