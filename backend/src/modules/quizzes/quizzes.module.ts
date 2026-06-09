import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from '../classes/entities/class.entity';
import { ClassesRepository } from '../classes/repositories/classes.repository';
import { Quiz } from './entities/quiz.entity';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { QuizzesRepository } from './repositories/quizzes.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Class])],
  controllers: [QuizzesController],
  providers: [QuizzesService, QuizzesRepository, ClassesRepository],
  exports: [QuizzesService],
})
export class QuizzesModule { }
