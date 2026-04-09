import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentProfileDto } from './dtos/create-student-profile.dto';
import { UpdateStudentProfileDto } from './dtos/update-student-profile.dto';
import { StudentProfile } from './entities/student-profile.entity';
import { StudentProfilesRepository } from './repositories/student-profiles.repository';

@Injectable()
export class StudentProfilesService {
  constructor(
    private readonly studentProfilesRepository: StudentProfilesRepository,
  ) {}

  create(dto: CreateStudentProfileDto) {
    const payload: Partial<StudentProfile> = {
      user_id: dto.user_id,
      student_code: dto.student_code,
      date_of_birth: new Date(dto.date_of_birth),
      gender: dto.gender,
      school: dto.school,
      major: dto.major,
      year: dto.year,
      batch: dto.batch,
      status: dto.status,
    };
    return this.studentProfilesRepository.createOne(payload);
  }

  findAll() {
    return this.studentProfilesRepository.findAll();
  }

  async findOne(id: number) {
    const profile = await this.studentProfilesRepository.findById(id);
    if (!profile) throw new NotFoundException('StudentProfile not found');
    return profile;
  }

  async update(id: number, dto: UpdateStudentProfileDto) {
    const existing = await this.studentProfilesRepository.findById(id);
    if (!existing) throw new NotFoundException('StudentProfile not found');
    const payload: Partial<StudentProfile> = {};
    if (dto.user_id !== undefined) payload.user_id = dto.user_id;
    if (dto.student_code !== undefined) payload.student_code = dto.student_code;
    if (dto.date_of_birth !== undefined)
      payload.date_of_birth = new Date(dto.date_of_birth);
    if (dto.gender !== undefined) payload.gender = dto.gender;
    if (dto.school !== undefined) payload.school = dto.school;
    if (dto.major !== undefined) payload.major = dto.major;
    if (dto.year !== undefined) payload.year = dto.year;
    if (dto.batch !== undefined) payload.batch = dto.batch;
    if (dto.status !== undefined) payload.status = dto.status;
    return this.studentProfilesRepository.updateOne(id, payload);
  }

  async remove(id: number) {
    const existing = await this.studentProfilesRepository.findById(id);
    if (!existing) throw new NotFoundException('StudentProfile not found');
    await this.studentProfilesRepository.removeOne(id);
    return { deleted: true };
  }
}
