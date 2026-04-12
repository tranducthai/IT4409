import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassMember } from '../entities/class-member.entity';

@Injectable()
export class ClassMembersRepository {
  constructor(
    @InjectRepository(ClassMember)
    private readonly repo: Repository<ClassMember>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  createOne(data: Partial<ClassMember>) {
    return this.repo.save(this.repo.create(data));
  }

  async updateOne(id: string, data: Partial<ClassMember>) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  async removeOne(id: string) {
    await this.repo.delete({ id });
  }
}
