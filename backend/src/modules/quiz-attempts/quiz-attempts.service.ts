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
    };
    if (dto.start_time !== undefined)
      payload.start_time = new Date(dto.start_time);
    if (dto.end_time !== undefined) payload.end_time = new Date(dto.end_time);
    return this.quizAttemptsRepository.createOne(payload);
  }

  findAll() {
    return this.quizAttemptsRepository.findAll();
  }

  async findOne(id: string) {
    const item = await this.quizAttemptsRepository.findById(id);
    if (!item) throw new NotFoundException('QuizAttempt not found');
    return item;
  }

  async update(id: string, dto: UpdateQuizAttemptDto) {
    const existing = await this.quizAttemptsRepository.findById(id);
    if (!existing) throw new NotFoundException('QuizAttempt not found');
    const payload: Partial<QuizAttempt> = {};
    if (dto.quiz_id !== undefined) payload.quiz_id = dto.quiz_id;
    if (dto.student_id !== undefined) payload.student_id = dto.student_id;
    if (dto.score !== undefined) payload.score = dto.score;
    if (dto.start_time !== undefined)
      payload.start_time = new Date(dto.start_time);
    if (dto.end_time !== undefined) payload.end_time = new Date(dto.end_time);
    return this.quizAttemptsRepository.updateOne(id, payload);
  }

  async remove(id: string) {
    const existing = await this.quizAttemptsRepository.findById(id);
    if (!existing) throw new NotFoundException('QuizAttempt not found');
    await this.quizAttemptsRepository.removeOne(id);
    return { deleted: true };
  }
}
