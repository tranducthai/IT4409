import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstructorProfile } from '../entities/instructor-profile.entity';

@Injectable()
export class InstructorProfilesRepository {
  constructor(
    @InjectRepository(InstructorProfile)
    private readonly repo: Repository<InstructorProfile>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  createOne(data: Partial<InstructorProfile>) {
    return this.repo.save(this.repo.create(data));
  }

  async updateOne(id: number, data: Partial<InstructorProfile>) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  async removeOne(id: number) {
    await this.repo.delete({ id });
  }
}
