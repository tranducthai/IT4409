import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInstructorProfileDto } from './dtos/create-instructor-profile.dto';
import { UpdateInstructorProfileDto } from './dtos/update-instructor-profile.dto';
import { InstructorProfile } from './entities/instructor-profile.entity';
import { InstructorProfilesRepository } from './repositories/instructor-profiles.repository';

@Injectable()
export class InstructorProfilesService {
  constructor(
    private readonly instructorProfilesRepository: InstructorProfilesRepository,
  ) {}

  create(dto: CreateInstructorProfileDto) {
    const payload: Partial<InstructorProfile> = {
      user_id: dto.user_id,
      instructor_code: dto.instructor_code,
      date_of_birth: new Date(dto.date_of_birth),
      gender: dto.gender,
      university: dto.university,
      major: dto.major,
      degree: dto.degree,
      experience_years: dto.experience_years,
      bio: dto.bio,
    };
    return this.instructorProfilesRepository.createOne(payload);
  }

  findAll() {
    return this.instructorProfilesRepository.findAll();
  }

  async findOne(id: number) {
    const profile = await this.instructorProfilesRepository.findById(id);
    if (!profile) throw new NotFoundException('InstructorProfile not found');
    return profile;
  }

  async update(id: number, dto: UpdateInstructorProfileDto) {
    const existing = await this.instructorProfilesRepository.findById(id);
    if (!existing) throw new NotFoundException('InstructorProfile not found');
    const payload: Partial<InstructorProfile> = {};
    if (dto.user_id !== undefined) payload.user_id = dto.user_id;
    if (dto.instructor_code !== undefined)
      payload.instructor_code = dto.instructor_code;
    if (dto.date_of_birth !== undefined)
      payload.date_of_birth = new Date(dto.date_of_birth);
    if (dto.gender !== undefined) payload.gender = dto.gender;
    if (dto.university !== undefined) payload.university = dto.university;
    if (dto.major !== undefined) payload.major = dto.major;
    if (dto.degree !== undefined) payload.degree = dto.degree;
    if (dto.experience_years !== undefined)
      payload.experience_years = dto.experience_years;
    if (dto.bio !== undefined) payload.bio = dto.bio;
    return this.instructorProfilesRepository.updateOne(id, payload);
  }

  async remove(id: number) {
    const existing = await this.instructorProfilesRepository.findById(id);
    if (!existing) throw new NotFoundException('InstructorProfile not found');
    await this.instructorProfilesRepository.removeOne(id);
    return { deleted: true };
  }
}
