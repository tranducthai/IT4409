import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentPage } from '../entities/content-page.entity';

@Injectable()
export class ContentPagesRepository {
  constructor(
    @InjectRepository(ContentPage)
    private readonly repo: Repository<ContentPage>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  createOne(data: Partial<ContentPage>) {
    return this.repo.save(this.repo.create(data));
  }

  async updateOne(id: string, data: Partial<ContentPage>) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  async removeOne(id: string) {
    await this.repo.delete({ id });
  }
}
