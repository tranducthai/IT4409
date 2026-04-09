import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonContent } from './entities/lesson-content.entity';
import { LessonContentsController } from './lesson-contents.controller';
import { LessonContentsService } from './lesson-contents.service';
import { LessonContentsRepository } from './repositories/lesson-contents.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LessonContent])],
  controllers: [LessonContentsController],
  providers: [LessonContentsService, LessonContentsRepository],
  exports: [LessonContentsService],
})
export class LessonContentsModule {}
