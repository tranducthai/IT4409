import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInstructorProfileDto } from './dtos/create-instructor-profile.dto';
import { UpdateInstructorProfileDto } from './dtos/update-instructor-profile.dto';
import { TeacherProfile } from './entities/instructor-profile.entity';
import { InstructorProfilesRepository } from './repositories/instructor-profiles.repository';

@Injectable()
export class InstructorProfilesService {
  constructor(
    private readonly instructorProfilesRepository: InstructorProfilesRepository,
  ) {}

  create(dto: CreateInstructorProfileDto) {
    const payload: Partial<TeacherProfile> = {
      user_id: dto.user_id,
      specialization: dto.specialization,
      degree: dto.degree ?? null,
      bio: dto.bio ?? null,
    };
    return this.instructorProfilesRepository.createOne(payload);
  }

  findAll() {
    return this.instructorProfilesRepository.findAll();
  }

  async findOne(id: string) {
    const profile = await this.instructorProfilesRepository.findById(id);
    if (!profile) throw new NotFoundException('TeacherProfile not found');
    return profile;
  }

  async update(id: string, dto: UpdateInstructorProfileDto) {
    const existing = await this.instructorProfilesRepository.findById(id);
    if (!existing) throw new NotFoundException('TeacherProfile not found');
    const payload: Partial<TeacherProfile> = {};
    if (dto.user_id !== undefined) payload.user_id = dto.user_id;
    if (dto.specialization !== undefined)
      payload.specialization = dto.specialization;
    if (dto.degree !== undefined) payload.degree = dto.degree;
    if (dto.bio !== undefined) payload.bio = dto.bio;
    return this.instructorProfilesRepository.updateOne(id, payload);
  }

  async remove(id: string) {
    const existing = await this.instructorProfilesRepository.findById(id);
    if (!existing) throw new NotFoundException('TeacherProfile not found');
    await this.instructorProfilesRepository.removeOne(id);
    return { deleted: true };
  }
}
