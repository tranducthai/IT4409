import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from '../questions/entities/question.entity';
import { QuestionsController } from '../questions/questions.controller';
import { QuestionsService } from '../questions/questions.service';
import { QuestionsRepository } from '../questions/repositories/questions.repository';
import { QuizAnswer } from '../quiz-answers/entities/quiz-answer.entity';
import { QuizAnswersController } from '../quiz-answers/quiz-answers.controller';
import { QuizAnswersService } from '../quiz-answers/quiz-answers.service';
import { QuizAnswersRepository } from '../quiz-answers/repositories/quiz-answers.repository';
import { QuizAttempt } from '../quiz-attempts/entities/quiz-attempt.entity';
import { QuizAttemptsController } from '../quiz-attempts/quiz-attempts.controller';
import { QuizAttemptsService } from '../quiz-attempts/quiz-attempts.service';
import { QuizAttemptsRepository } from '../quiz-attempts/repositories/quiz-attempts.repository';
import { Quiz } from '../quizzes/entities/quiz.entity';
import { QuizzesController } from '../quizzes/quizzes.controller';
import { QuizzesService } from '../quizzes/quizzes.service';
import { QuizzesRepository } from '../quizzes/repositories/quizzes.repository';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quiz, Question, QuizAttempt, QuizAnswer]),
  ],
  controllers: [
    // Business quiz-taking endpoints
    QuizController,
    // CRUD endpoints (kept, but owned by QuizModule)
    QuizzesController,
    QuestionsController,
    QuizAttemptsController,
    QuizAnswersController,
  ],
  providers: [
    QuizService,
    QuizzesService,
    QuizzesRepository,
    QuestionsService,
    QuestionsRepository,
    QuizAttemptsService,
    QuizAttemptsRepository,
    QuizAnswersService,
    QuizAnswersRepository,
  ],
})
export class QuizModule {}
