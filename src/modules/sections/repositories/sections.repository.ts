import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from '../entities/section.entity';

@Injectable()
export class SectionsRepository {
  constructor(
    @InjectRepository(Section)
    private readonly repo: Repository<Section>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  createOne(data: Partial<Section>) {
    return this.repo.save(this.repo.create(data));
  }

  async updateOne(id: number, data: Partial<Section>) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  async removeOne(id: number) {
    await this.repo.delete({ id });
  }
}
