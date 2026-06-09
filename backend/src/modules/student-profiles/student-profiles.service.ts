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
      class_name: dto.class_name,
      major: dto.major,
      course_year: dto.course_year,
      phone: dto.phone ?? null,
      dob: dto.dob ? new Date(dto.dob) : null,
    };
    return this.studentProfilesRepository.createOne(payload);
  }

  findAll() {
    return this.studentProfilesRepository.findAll();
  }

  async findOne(id: string) {
    const profile = await this.studentProfilesRepository.findById(id);
    if (!profile) throw new NotFoundException('StudentProfile not found');
    return profile;
  }

  async update(id: string, dto: UpdateStudentProfileDto) {
    const existing = await this.studentProfilesRepository.findById(id);
    if (!existing) throw new NotFoundException('StudentProfile not found');
    const payload: Partial<StudentProfile> = {};
    if (dto.user_id !== undefined) payload.user_id = dto.user_id;
    if (dto.student_code !== undefined) payload.student_code = dto.student_code;
    if (dto.class_name !== undefined) payload.class_name = dto.class_name;
    if (dto.major !== undefined) payload.major = dto.major;
    if (dto.course_year !== undefined) payload.course_year = dto.course_year;
    if (dto.phone !== undefined) payload.phone = dto.phone;
    if (dto.dob !== undefined) payload.dob = dto.dob ? new Date(dto.dob) : null;
    return this.studentProfilesRepository.updateOne(id, payload);
  }

  async remove(id: string) {
    const existing = await this.studentProfilesRepository.findById(id);
    if (!existing) throw new NotFoundException('StudentProfile not found');
    await this.studentProfilesRepository.removeOne(id);
    return { deleted: true };
  }
}
