import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from '../assignments/entities/assignment.entity';
import { AssignmentsRepository } from '../assignments/repositories/assignments.repository';
import { ClassMember } from '../class-members/entities/class-member.entity';
import { ClassMembersRepository } from '../class-members/repositories/class-members.repository';
import { QuizAttempt } from '../quiz-attempts/entities/quiz-attempt.entity';
import { QuizAttemptsRepository } from '../quiz-attempts/repositories/quiz-attempts.repository';
import { Quiz } from '../quizzes/entities/quiz.entity';
import { QuizzesRepository } from '../quizzes/repositories/quizzes.repository';
import { SubmissionFile } from '../submissions/entities/submission-file.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { SubmissionsRepository } from '../submissions/repositories/submissions.repository';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { Class } from './entities/class.entity';
import { ClassesRepository } from './repositories/classes.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Class,
      ClassMember,
      Assignment,
      Submission,
      SubmissionFile,
      Quiz,
      QuizAttempt,
    ]),
  ],
  controllers: [ClassesController],
  providers: [
    ClassesService,
    ClassesRepository,
    ClassMembersRepository,
    AssignmentsRepository,
    SubmissionsRepository,
    QuizzesRepository,
    QuizAttemptsRepository,
  ],
  exports: [ClassesService],
})
export class ClassesModule { }
