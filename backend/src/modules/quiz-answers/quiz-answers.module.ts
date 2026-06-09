import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizAnswer } from './entities/quiz-answer.entity';
import { QuizAnswersController } from './quiz-answers.controller';
import { QuizAnswersService } from './quiz-answers.service';
import { QuizAnswersRepository } from './repositories/quiz-answers.repository';

@Module({
  imports: [TypeOrmModule.forFeature([QuizAnswer])],
  controllers: [QuizAnswersController],
  providers: [QuizAnswersService, QuizAnswersRepository],
  exports: [QuizAnswersService],
})
export class QuizAnswersModule {}
