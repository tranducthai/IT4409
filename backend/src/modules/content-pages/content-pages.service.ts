import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentPage } from './entities/content-page.entity';
import { CreateContentPageDto } from './dtos/create-content-page.dto';
import { UpdateContentPageDto } from './dtos/update-content-page.dto';
import { ContentPagesRepository } from './repositories/content-pages.repository';

@Injectable()
export class ContentPagesService {
  constructor(
    private readonly contentPagesRepository: ContentPagesRepository,
  ) {}

  create(dto: CreateContentPageDto) {
    const payload: Partial<ContentPage> = {
      content_id: dto.content_id,
      video_url: dto.video_url ?? null,
      document_url: dto.document_url ?? null,
      quiz_id: dto.quiz_id ?? null,
    };
    return this.contentPagesRepository.createOne(payload);
  }

  findAll() {
    return this.contentPagesRepository.findAll();
  }

  async findOne(id: string) {
    const item = await this.contentPagesRepository.findById(id);
    if (!item) throw new NotFoundException('ContentPage not found');
    return item;
  }

  async update(id: string, dto: UpdateContentPageDto) {
    const existing = await this.contentPagesRepository.findById(id);
    if (!existing) throw new NotFoundException('ContentPage not found');

    const payload: Partial<ContentPage> = {};
    if (dto.content_id !== undefined) payload.content_id = dto.content_id;
    if (dto.video_url !== undefined) payload.video_url = dto.video_url;
    if (dto.document_url !== undefined) payload.document_url = dto.document_url;
    if (dto.quiz_id !== undefined) payload.quiz_id = dto.quiz_id;

    return this.contentPagesRepository.updateOne(id, payload);
  }

  async remove(id: string) {
    const existing = await this.contentPagesRepository.findById(id);
    if (!existing) throw new NotFoundException('ContentPage not found');
    await this.contentPagesRepository.removeOne(id);
    return { deleted: true };
  }
}
