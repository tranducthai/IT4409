import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from '../entities/class.entity';

@Injectable()
export class ClassesRepository {
  constructor(
    @InjectRepository(Class)
    private readonly repo: Repository<Class>,
  ) { }

  findAll() {
    return this.repo.find();
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  findManyByTeacherId(teacher_id: string) {
    return this.repo.find({ where: { teacher_id }, order: { created_at: 'DESC' } });
  }

  createOne(data: Partial<Class>) {
    return this.repo.save(this.repo.create(data));
  }

  async updateOne(id: string, data: Partial<Class>) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  async removeOne(id: string) {
    await this.repo.delete({ id });
  }
}
