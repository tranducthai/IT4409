import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentProfile } from '../entities/student-profile.entity';

@Injectable()
export class StudentProfilesRepository {
  constructor(
    @InjectRepository(StudentProfile)
    private readonly repo: Repository<StudentProfile>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  createOne(data: Partial<StudentProfile>) {
    return this.repo.save(this.repo.create(data));
  }

  async updateOne(id: string, data: Partial<StudentProfile>) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  async removeOne(id: string) {
    await this.repo.delete({ id });
  }
}
