import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizAnswer } from '../entities/quiz-answer.entity';

@Injectable()
export class QuizAnswersRepository {
  constructor(
    @InjectRepository(QuizAnswer)
    private readonly repo: Repository<QuizAnswer>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  createOne(data: Partial<QuizAnswer>) {
    return this.repo.save(this.repo.create(data));
  }

  async updateOne(id: string, data: Partial<QuizAnswer>) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  async removeOne(id: string) {
    await this.repo.delete({ id });
  }
}
