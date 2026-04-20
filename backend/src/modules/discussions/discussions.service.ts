import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDiscussionDto } from './dtos/create-discussion.dto';
import { UpdateDiscussionDto } from './dtos/update-discussion.dto';
import { DiscussionsRepository } from './repositories/discussions.repository';

@Injectable()
export class DiscussionsService {
    constructor(private readonly discussionsRepository: DiscussionsRepository) { }

    create(dto: CreateDiscussionDto) {
        return this.discussionsRepository.createOne({
            class_id: dto.class_id,
            created_by: dto.created_by,
            title: dto.title,
            content: dto.content ?? null,
        });
    }

    findAll() {
        return this.discussionsRepository.findAll();
    }

    async findOne(id: string) {
        const item = await this.discussionsRepository.findById(id);
        if (!item) throw new NotFoundException('Discussion not found');
        return item;
    }

    async update(id: string, dto: UpdateDiscussionDto) {
        const existing = await this.discussionsRepository.findById(id);
        if (!existing) throw new NotFoundException('Discussion not found');

        return this.discussionsRepository.updateOne(id, {
            ...dto,
            content: dto.content === undefined ? undefined : (dto.content ?? null),
        });
    }

    async remove(id: string) {
        const existing = await this.discussionsRepository.findById(id);
        if (!existing) throw new NotFoundException('Discussion not found');
        await this.discussionsRepository.removeOne(id);
        return { deleted: true };
    }
}
