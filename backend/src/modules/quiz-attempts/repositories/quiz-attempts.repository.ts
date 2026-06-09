import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizAttempt } from '../entities/quiz-attempt.entity';

@Injectable()
export class QuizAttemptsRepository {
  constructor(
    @InjectRepository(QuizAttempt)
    private readonly repo: Repository<QuizAttempt>,
  ) { }

  findAll() {
    return this.repo.find();
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  createOne(data: Partial<QuizAttempt>) {
    return this.repo.save(this.repo.create(data));
  }

  async updateOne(id: string, data: Partial<QuizAttempt>) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  async removeOne(id: string) {
    await this.repo.delete({ id });
  }

  async findBestScoresByQuizIds(quizIds: string[]) {
    if (!quizIds.length) return [] as {
      quiz_id: string;
      student_id: string;
      best_score: number | null;
      last_end_time: Date | null;
      student_full_name: string | null;
      student_avatar_url: string | null;
    }[];

    return this.repo
      .createQueryBuilder('attempt')
      .leftJoin('attempt.student', 'student')
      .where('attempt.quiz_id IN (:...quizIds)', { quizIds })
      .andWhere('attempt.score IS NOT NULL')
      .select('attempt.quiz_id', 'quiz_id')
      .addSelect('attempt.student_id', 'student_id')
      .addSelect('MAX(attempt.score)', 'best_score')
      .addSelect('MAX(attempt.end_time)', 'last_end_time')
      .addSelect('student.full_name', 'student_full_name')
      .addSelect('student.avatar_url', 'student_avatar_url')
      .groupBy('attempt.quiz_id')
      .addGroupBy('attempt.student_id')
      .addGroupBy('student.full_name')
      .addGroupBy('student.avatar_url')
      .getRawMany();
  }
}
