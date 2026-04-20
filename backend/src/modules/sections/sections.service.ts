import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSectionDto } from './dtos/create-section.dto';
import { UpdateSectionDto } from './dtos/update-section.dto';
import { SectionsRepository } from './repositories/sections.repository';

@Injectable()
export class SectionsService {
  constructor(private readonly sectionsRepository: SectionsRepository) {}

  create(dto: CreateSectionDto) {
    return this.sectionsRepository.createOne(dto);
  }

  findAll() {
    return this.sectionsRepository.findAll();
  }

  async findOne(id: number) {
    const item = await this.sectionsRepository.findById(id);
    if (!item) throw new NotFoundException('Section not found');
    return item;
  }

  async update(id: number, dto: UpdateSectionDto) {
    const existing = await this.sectionsRepository.findById(id);
    if (!existing) throw new NotFoundException('Section not found');
    return this.sectionsRepository.updateOne(id, dto);
  }

  async remove(id: number) {
    const existing = await this.sectionsRepository.findById(id);
    if (!existing) throw new NotFoundException('Section not found');
    await this.sectionsRepository.removeOne(id);
    return { deleted: true };
  }
}
