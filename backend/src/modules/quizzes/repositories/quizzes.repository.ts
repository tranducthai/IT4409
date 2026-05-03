import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from '../entities/quiz.entity';

@Injectable()
export class QuizzesRepository {
  constructor(
    @InjectRepository(Quiz)
    private readonly repo: Repository<Quiz>,
  ) { }

  findAll() {
    return this.repo.find();
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  findByClassId(class_id: string) {
    return this.repo.find({ where: { class_id }, order: { created_at: 'DESC' } });
  }

  createOne(data: Partial<Quiz>) {
    return this.repo.save(this.repo.create(data));
  }

  async updateOne(id: string, data: Partial<Quiz>) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  async removeOne(id: string) {
    await this.repo.delete({ id });
  }
}
