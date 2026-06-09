import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWeekDto } from './dtos/create-week.dto';
import { UpdateWeekDto } from './dtos/update-week.dto';
import { Week } from './entities/week.entity';
import { WeeksRepository } from './repositories/weeks.repository';

@Injectable()
export class WeeksService {
  constructor(private readonly weeksRepository: WeeksRepository) {}

  create(dto: CreateWeekDto) {
    const payload: Partial<Week> = {
      class_id: dto.class_id,
      title: dto.title,
      week_number: dto.week_number,
    };
    return this.weeksRepository.createOne(payload);
  }

  findAll() {
    return this.weeksRepository.findAll();
  }

  async findOne(id: string) {
    const item = await this.weeksRepository.findById(id);
    if (!item) throw new NotFoundException('Week not found');
    return item;
  }

  async update(id: string, dto: UpdateWeekDto) {
    const existing = await this.weeksRepository.findById(id);
    if (!existing) throw new NotFoundException('Week not found');
    return this.weeksRepository.updateOne(id, dto);
  }

  async remove(id: string) {
    const existing = await this.weeksRepository.findById(id);
    if (!existing) throw new NotFoundException('Week not found');
    await this.weeksRepository.removeOne(id);
    return { deleted: true };
  }
}
