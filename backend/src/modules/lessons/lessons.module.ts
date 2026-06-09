import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonProgressModule } from '../lesson-progress/lesson-progress.module';
import { Lesson } from './entities/lesson.entity';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { LessonsRepository } from './repositories/lessons.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson]), LessonProgressModule],
  controllers: [LessonsController],
  providers: [LessonsService, LessonsRepository],
  exports: [LessonsService],
})
export class LessonsModule {}
