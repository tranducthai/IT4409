import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Week } from '../entities/week.entity';

@Injectable()
export class WeeksRepository {
  constructor(
    @InjectRepository(Week)
    private readonly repo: Repository<Week>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  createOne(data: Partial<Week>) {
    return this.repo.save(this.repo.create(data));
  }

  async updateOne(id: string, data: Partial<Week>) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  async removeOne(id: string) {
    await this.repo.delete({ id });
  }
}
