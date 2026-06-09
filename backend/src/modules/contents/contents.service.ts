import { Injectable, NotFoundException } from '@nestjs/common';
import { Content } from './entities/content.entity';
import { CreateContentDto } from './dtos/create-content.dto';
import { UpdateContentDto } from './dtos/update-content.dto';
import { ContentsRepository } from './repositories/contents.repository';

@Injectable()
export class ContentsService {
  constructor(private readonly contentsRepository: ContentsRepository) {}

  create(dto: CreateContentDto) {
    const payload: Partial<Content> = {
      week_id: dto.week_id,
      title: dto.title,
      type: dto.type,
      order_index: dto.order_index,
    };
    return this.contentsRepository.createOne(payload);
  }

  findAll() {
    return this.contentsRepository.findAll();
  }

  async findOne(id: string) {
    const item = await this.contentsRepository.findById(id);
    if (!item) throw new NotFoundException('Content not found');
    return item;
  }

  async update(id: string, dto: UpdateContentDto) {
    const existing = await this.contentsRepository.findById(id);
    if (!existing) throw new NotFoundException('Content not found');
    return this.contentsRepository.updateOne(id, dto);
  }

  async remove(id: string) {
    const existing = await this.contentsRepository.findById(id);
    if (!existing) throw new NotFoundException('Content not found');
    await this.contentsRepository.removeOne(id);
    return { deleted: true };
  }
}
