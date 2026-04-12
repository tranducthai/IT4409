import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Question } from '../questions/entities/question.entity';
import { QuizAnswer } from '../quiz-answers/entities/quiz-answer.entity';
import { QuizAttempt } from '../quiz-attempts/entities/quiz-attempt.entity';
import { Quiz } from '../quizzes/entities/quiz.entity';
import { SubmitQuizDto } from './dtos/submit-quiz.dto';

const ALLOWED_CHOICES = new Set(['A', 'B', 'C', 'D']);

function normalizeChoice(value: string) {
  return value.trim().toUpperCase();
}

function addMinutes(value: Date, minutes: number) {
  return new Date(value.getTime() + minutes * 60_000);
}

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepo: Repository<Quiz>,
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    @InjectRepository(QuizAttempt)
    private readonly attemptRepo: Repository<QuizAttempt>,
    @InjectRepository(QuizAnswer)
    private readonly quizAnswerRepo: Repository<QuizAnswer>,
  ) {}

  async getQuizForTaking(quizId: string) {
    const quiz = await this.quizRepo.findOne({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const questions = await this.questionRepo.find({
      where: { quiz_id: quizId },
    });

    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      time_limit: quiz.time_limit,
      time_limit_unit: 'minutes' as const,
      total_questions: quiz.total_questions,
      questions: questions.map((q) => ({
        id: q.id,
        quiz_id: q.quiz_id,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
      })),
    };
  }

  async startAttempt(quizId: string, studentId: string) {
    const quiz = await this.quizRepo.findOne({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const existing = await this.attemptRepo.findOne({
      where: { quiz_id: quizId, student_id: studentId, end_time: IsNull() },
      order: { start_time: 'DESC' },
    });

    if (existing) {
      const expiresAt = addMinutes(existing.start_time, quiz.time_limit);
      const now = new Date();

      // If an attempt is open but already expired, close it and start a new one.
      if (now.getTime() > expiresAt.getTime()) {
        await this.attemptRepo.update(
          { id: existing.id },
          {
            end_time:
              now.getTime() <= existing.start_time.getTime()
                ? new Date(existing.start_time.getTime() + 1)
                : now,
          },
        );
      } else {
        return {
          attempt_id: existing.id,
          start_time: existing.start_time,
          expires_at: expiresAt,
          time_limit: quiz.time_limit,
          time_limit_unit: 'minutes' as const,
        };
      }
    }

    const attempt = await this.attemptRepo.save(
      this.attemptRepo.create({
        quiz_id: quizId,
        student_id: studentId,
        end_time: null,
        score: null,
      }),
    );

    return {
      attempt_id: attempt.id,
      start_time: attempt.start_time,
      expires_at: addMinutes(attempt.start_time, quiz.time_limit),
      time_limit: quiz.time_limit,
      time_limit_unit: 'minutes' as const,
    };
  }

  async submitAttempt(quizId: string, studentId: string, dto: SubmitQuizDto) {
    const quiz = await this.quizRepo.findOne({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const attempt = await this.attemptRepo.findOne({
      where: { id: dto.attempt_id },
    });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.quiz_id !== quizId)
      throw new ForbiddenException('Invalid attempt');
    if (attempt.student_id !== studentId)
      throw new ForbiddenException('Invalid attempt');

    if (attempt.end_time)
      throw new ConflictException('Attempt already submitted');

    const now = new Date();
    const expiresAt = addMinutes(attempt.start_time, quiz.time_limit);
    if (now.getTime() > expiresAt.getTime()) {
      throw new ForbiddenException('Time limit exceeded');
    }

    const questions = await this.questionRepo.find({
      where: { quiz_id: quizId },
    });
    const questionById = new Map<string, Question>();
    for (const q of questions) questionById.set(q.id, q);

    const selectedByQuestion = new Map<string, string>();
    for (const a of dto.answers) {
      if (!questionById.has(a.question_id)) {
        throw new ForbiddenException('Answer contains invalid question_id');
      }
      if (selectedByQuestion.has(a.question_id)) {
        throw new BadRequestException('Duplicate answers for question_id');
      }
      const normalized = normalizeChoice(a.selected_answer);
      if (!ALLOWED_CHOICES.has(normalized)) {
        throw new BadRequestException('selected_answer must be A, B, C, or D');
      }
      selectedByQuestion.set(a.question_id, normalized);
    }

    let correctCount = 0;
    const toSave: QuizAnswer[] = [];
    for (const [question_id, selected_answer] of selectedByQuestion.entries()) {
      const q = questionById.get(question_id);
      if (!q) continue;
      const isCorrect =
        normalizeChoice(q.correct_answer) === normalizeChoice(selected_answer);
      if (isCorrect) correctCount += 1;

      toSave.push(
        this.quizAnswerRepo.create({
          attempt_id: attempt.id,
          question_id,
          selected_answer,
          is_correct: isCorrect,
        }),
      );
    }

    const totalQuestions = questions.length;
    const score = totalQuestions ? (correctCount / totalQuestions) * 100 : 0;

    await this.quizAnswerRepo.delete({ attempt_id: attempt.id });
    if (toSave.length) await this.quizAnswerRepo.save(toSave);

    const endTime =
      now.getTime() <= attempt.start_time.getTime()
        ? new Date(attempt.start_time.getTime() + 1)
        : now;

    await this.attemptRepo.update(
      { id: attempt.id },
      { score, end_time: endTime },
    );

    return {
      attempt_id: attempt.id,
      quiz_id: quizId,
      end_time: endTime,
      expires_at: expiresAt,
      total_questions: totalQuestions,
      correct: correctCount,
      score,
      score_unit: 'percent' as const,
    };
  }

  async listMyAttempts(quizId: string, studentId: string) {
    const quiz = await this.quizRepo.findOne({
      where: { id: quizId },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const attempts = await this.attemptRepo.find({
      where: { quiz_id: quizId, student_id: studentId },
      order: { start_time: 'DESC' },
    });

    return attempts.map((a) => ({
      id: a.id,
      quiz_id: a.quiz_id,
      score: a.score,
      start_time: a.start_time,
      end_time: a.end_time,
      is_submitted: a.end_time !== null,
      expires_at: addMinutes(a.start_time, quiz.time_limit),
    }));
  }

  async getAttemptResult(attemptId: string, studentId: string) {
    const attempt = await this.attemptRepo.findOne({
      where: { id: attemptId },
    });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.student_id !== studentId) {
      throw new ForbiddenException('Invalid attempt');
    }

    const quiz = await this.quizRepo.findOne({
      where: { id: attempt.quiz_id },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const selected = await this.quizAnswerRepo.find({
      where: { attempt_id: attempt.id },
    });

    return {
      attempt_id: attempt.id,
      quiz_id: attempt.quiz_id,
      score: attempt.score,
      score_unit: 'percent' as const,
      start_time: attempt.start_time,
      end_time: attempt.end_time,
      is_submitted: attempt.end_time !== null,
      expires_at: addMinutes(attempt.start_time, quiz.time_limit),
      answers: selected.map((a) => ({
        question_id: a.question_id,
        selected_answer: a.selected_answer,
        is_correct: a.is_correct,
      })),
    };
  }
}
