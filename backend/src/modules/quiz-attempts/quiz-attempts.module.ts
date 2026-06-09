import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { QuizAttemptsController } from './quiz-attempts.controller';
import { QuizAttemptsService } from './quiz-attempts.service';
import { QuizAttemptsRepository } from './repositories/quiz-attempts.repository';

@Module({
  imports: [TypeOrmModule.forFeature([QuizAttempt])],
  controllers: [QuizAttemptsController],
  providers: [QuizAttemptsService, QuizAttemptsRepository],
  exports: [QuizAttemptsService],
})
export class QuizAttemptsModule {}
