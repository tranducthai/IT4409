import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from '../entities/class.entity';

@Injectable()
export class ClassesRepository {
  constructor(
    @InjectRepository(Class)
    private readonly repo: Repository<Class>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  createOne(data: Partial<Class>) {
    return this.repo.save(this.repo.create(data));
  }

  async updateOne(id: number, data: Partial<Class>) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  async removeOne(id: number) {
    await this.repo.delete({ id });
  }
}
