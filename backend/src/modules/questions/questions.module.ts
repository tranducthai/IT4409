import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from '../classes/entities/class.entity';
import { ClassesRepository } from '../classes/repositories/classes.repository';
import { Quiz } from '../quizzes/entities/quiz.entity';
import { QuizzesRepository } from '../quizzes/repositories/quizzes.repository';
import { Question } from './entities/question.entity';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { QuestionsRepository } from './repositories/questions.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Quiz, Class])],
  controllers: [QuestionsController],
  providers: [QuestionsService, QuestionsRepository, QuizzesRepository, ClassesRepository],
  exports: [QuestionsService],
})
export class QuestionsModule { }
