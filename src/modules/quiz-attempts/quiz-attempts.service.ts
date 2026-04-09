import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuizAttemptDto } from './dtos/create-quiz-attempt.dto';
import { UpdateQuizAttemptDto } from './dtos/update-quiz-attempt.dto';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { QuizAttemptsRepository } from './repositories/quiz-attempts.repository';

@Injectable()
export class QuizAttemptsService {
  constructor(
    private readonly quizAttemptsRepository: QuizAttemptsRepository,
  ) {}

  create(dto: CreateQuizAttemptDto) {
    const payload: Partial<QuizAttempt> = {
      quiz_id: dto.quiz_id,
      student_id: dto.student_id,
      score: dto.score,
      started_at: new Date(dto.started_at),
      submitted_at: new Date(dto.submitted_at),
    };
    return this.quizAttemptsRepository.createOne(payload);
  }

  findAll() {
    return this.quizAttemptsRepository.findAll();
  }

  async findOne(id: number) {
    const item = await this.quizAttemptsRepository.findById(id);
    if (!item) throw new NotFoundException('QuizAttempt not found');
    return item;
  }

  async update(id: number, dto: UpdateQuizAttemptDto) {
    const existing = await this.quizAttemptsRepository.findById(id);
    if (!existing) throw new NotFoundException('QuizAttempt not found');
    const payload: Partial<QuizAttempt> = {};
    if (dto.quiz_id !== undefined) payload.quiz_id = dto.quiz_id;
    if (dto.student_id !== undefined) payload.student_id = dto.student_id;
    if (dto.score !== undefined) payload.score = dto.score;
    if (dto.started_at !== undefined)
      payload.started_at = new Date(dto.started_at);
    if (dto.submitted_at !== undefined)
      payload.submitted_at = new Date(dto.submitted_at);
    return this.quizAttemptsRepository.updateOne(id, payload);
  }

  async remove(id: number) {
    const existing = await this.quizAttemptsRepository.findById(id);
    if (!existing) throw new NotFoundException('QuizAttempt not found');
    await this.quizAttemptsRepository.removeOne(id);
    return { deleted: true };
  }
}
