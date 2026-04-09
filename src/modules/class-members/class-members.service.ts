import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClassMemberDto } from './dtos/create-class-member.dto';
import { UpdateClassMemberDto } from './dtos/update-class-member.dto';
import { ClassMember } from './entities/class-member.entity';
import { ClassMembersRepository } from './repositories/class-members.repository';

@Injectable()
export class ClassMembersService {
  constructor(
    private readonly classMembersRepository: ClassMembersRepository,
  ) {}

  create(dto: CreateClassMemberDto) {
    const payload: Partial<ClassMember> = {
      class_id: dto.class_id,
      user_id: dto.user_id,
      role: dto.role,
      status: dto.status,
      joined_at: new Date(dto.joined_at),
    };
    return this.classMembersRepository.createOne(payload);
  }

  findAll() {
    return this.classMembersRepository.findAll();
  }

  async findOne(id: number) {
    const item = await this.classMembersRepository.findById(id);
    if (!item) throw new NotFoundException('ClassMember not found');
    return item;
  }

  async update(id: number, dto: UpdateClassMemberDto) {
    const existing = await this.classMembersRepository.findById(id);
    if (!existing) throw new NotFoundException('ClassMember not found');
    const payload: Partial<ClassMember> = {};
    if (dto.class_id !== undefined) payload.class_id = dto.class_id;
    if (dto.user_id !== undefined) payload.user_id = dto.user_id;
    if (dto.role !== undefined) payload.role = dto.role;
    if (dto.status !== undefined) payload.status = dto.status;
    if (dto.joined_at !== undefined)
      payload.joined_at = new Date(dto.joined_at);
    return this.classMembersRepository.updateOne(id, payload);
  }

  async remove(id: number) {
    const existing = await this.classMembersRepository.findById(id);
    if (!existing) throw new NotFoundException('ClassMember not found');
    await this.classMembersRepository.removeOne(id);
    return { deleted: true };
  }
}
