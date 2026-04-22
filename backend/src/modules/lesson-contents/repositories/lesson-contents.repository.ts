import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonContent } from '../entities/lesson-content.entity';

@Injectable()
export class LessonContentsRepository {
  constructor(
    @InjectRepository(LessonContent)
    private readonly repo: Repository<LessonContent>,
  ) { }

  findAll() {
    return this.repo.find();
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  createOne(data: Partial<LessonContent>) {
    return this.repo.save(this.repo.create(data));
  }

  createMany(data: Array<Partial<LessonContent>>) {
    return this.repo.save(this.repo.create(data));
  }

  async updateOne(id: number, data: Partial<LessonContent>) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  async removeOne(id: number) {
    await this.repo.delete({ id });
  }
}
