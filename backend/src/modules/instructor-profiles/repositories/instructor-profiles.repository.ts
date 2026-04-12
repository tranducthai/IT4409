import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherProfile } from '../entities/instructor-profile.entity';

@Injectable()
export class InstructorProfilesRepository {
  constructor(
    @InjectRepository(TeacherProfile)
    private readonly repo: Repository<TeacherProfile>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  createOne(data: Partial<TeacherProfile>) {
    return this.repo.save(this.repo.create(data));
  }

  async updateOne(id: string, data: Partial<TeacherProfile>) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  async removeOne(id: string) {
    await this.repo.delete({ id });
  }
}
