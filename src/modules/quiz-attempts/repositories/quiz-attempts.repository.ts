import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizAttempt } from '../entities/quiz-attempt.entity';

@Injectable()
export class QuizAttemptsRepository {
  constructor(
    @InjectRepository(QuizAttempt)
    private readonly repo: Repository<QuizAttempt>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  createOne(data: Partial<QuizAttempt>) {
    return this.repo.save(this.repo.create(data));
  }

  async updateOne(id: number, data: Partial<QuizAttempt>) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  async removeOne(id: number) {
    await this.repo.delete({ id });
  }
}
