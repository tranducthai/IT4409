import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { QuestionsRepository } from './repositories/questions.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Question])],
  controllers: [QuestionsController],
  providers: [QuestionsService, QuestionsRepository],
  exports: [QuestionsService],
})
export class QuestionsModule {}
