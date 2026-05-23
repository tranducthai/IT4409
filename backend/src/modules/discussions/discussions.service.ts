import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassMember } from '../class-members/entities/class-member.entity';
import { ClassMemberStatus } from '../class-members/enums/class-member-status.enum';
import { Class } from '../classes/entities/class.entity';
import { CreateDiscussionDto } from './dtos/create-discussion.dto';
import { UpdateDiscussionDto } from './dtos/update-discussion.dto';
import { DiscussionsRepository } from './repositories/discussions.repository';

@Injectable()
export class DiscussionsService {
    constructor(
        private readonly discussionsRepository: DiscussionsRepository,
        @InjectRepository(ClassMember)
        private readonly classMemberRepo: Repository<ClassMember>,
        @InjectRepository(Class)
        private readonly classRepo: Repository<Class>,
    ) { }

    private async ensureClassAccess(classId: string, userId: string) {
        const cls = await this.classRepo.findOne({ where: { id: classId } });
        if (!cls) throw new NotFoundException('Class not found');
        if (cls.teacher_id === userId) return;
        const member = await this.classMemberRepo.findOne({
            where: { class_id: classId, user_id: userId },
        });
        if (!member || member.status !== ClassMemberStatus.Active) {
            throw new ForbiddenException('You are not an active member of this class');
        }
    }

    async create(userId: string, dto: CreateDiscussionDto) {
        await this.ensureClassAccess(dto.class_id, userId);
        return this.discussionsRepository.createOne({
            class_id: dto.class_id,
            created_by: userId,
            title: dto.title,
            content: dto.content ?? null,
        });
    }

    async findByClassId(classId: string, userId: string) {
        await this.ensureClassAccess(classId, userId);
        return this.discussionsRepository.findByClassId(classId);
    }

    findAll() {
        return this.discussionsRepository.findAll();
    }

    async findOne(id: string) {
        const item = await this.discussionsRepository.findByIdWithAuthor(id);
        if (!item) throw new NotFoundException('Discussion not found');
        return item;
    }

    async update(userId: string, id: string, dto: UpdateDiscussionDto) {
        const existing = await this.discussionsRepository.findById(id);
        if (!existing) throw new NotFoundException('Discussion not found');
        if (existing.created_by !== userId) {
            throw new ForbiddenException('You can only edit your own discussions');
        }
        return this.discussionsRepository.updateOne(id, {
            title: dto.title,
            content: dto.content === undefined ? undefined : (dto.content ?? null),
        });
    }

    async remove(userId: string, id: string) {
        const existing = await this.discussionsRepository.findById(id);
        if (!existing) throw new NotFoundException('Discussion not found');
        if (existing.created_by !== userId) {
            const cls = await this.classRepo.findOne({ where: { id: existing.class_id } });
            if (!cls || cls.teacher_id !== userId) {
                throw new ForbiddenException('You do not have permission to delete this discussion');
            }
        }
        await this.discussionsRepository.removeOne(id);
        return { deleted: true };
    }
}
