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
import { Discussion } from '../discussions/entities/discussion.entity';
import { CreateMessageDto } from './dtos/create-message.dto';
import { UpdateMessageDto } from './dtos/update-message.dto';
import { MessagesRepository } from './repositories/messages.repository';

@Injectable()
export class MessagesService {
    constructor(
        private readonly messagesRepository: MessagesRepository,
        @InjectRepository(ClassMember)
        private readonly classMemberRepo: Repository<ClassMember>,
        @InjectRepository(Class)
        private readonly classRepo: Repository<Class>,
        @InjectRepository(Discussion)
        private readonly discussionRepo: Repository<Discussion>,
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

    async createAndReturn(userId: string, dto: CreateMessageDto) {
        const message = await this.create(userId, dto);
        return this.messagesRepository.findByIdWithAuthor(message.id);
    }

    async create(userId: string, dto: CreateMessageDto) {
        const discussion = await this.discussionRepo.findOne({
            where: { id: dto.discussion_id },
        });
        if (!discussion) throw new NotFoundException('Discussion not found');
        await this.ensureClassAccess(discussion.class_id, userId);
        return this.messagesRepository.createOne({
            discussion_id: dto.discussion_id,
            user_id: userId,
            content: dto.content,
            image_url: dto.image_url ?? null,
        });
    }

    findAll() {
        return this.messagesRepository.findAll();
    }

    async findByDiscussionId(discussionId: string, userId: string) {
        const discussion = await this.discussionRepo.findOne({
            where: { id: discussionId },
        });
        if (!discussion) throw new NotFoundException('Discussion not found');
        await this.ensureClassAccess(discussion.class_id, userId);
        return this.messagesRepository.findByDiscussionId(discussionId);
    }

    async findOne(id: string) {
        const item = await this.messagesRepository.findById(id);
        if (!item) throw new NotFoundException('Message not found');
        return item;
    }

    async update(userId: string, id: string, dto: UpdateMessageDto) {
        const existing = await this.messagesRepository.findById(id);
        if (!existing) throw new NotFoundException('Message not found');
        if (existing.user_id !== userId) {
            throw new ForbiddenException('You can only edit your own messages');
        }
        return this.messagesRepository.updateOne(id, { content: dto.content });
    }

    async remove(userId: string, id: string) {
        const existing = await this.messagesRepository.findById(id);
        if (!existing) throw new NotFoundException('Message not found');
        if (existing.user_id !== userId) {
            const discussion = await this.discussionRepo.findOne({
                where: { id: existing.discussion_id },
            });
            if (discussion) {
                const cls = await this.classRepo.findOne({
                    where: { id: discussion.class_id },
                });
                if (cls && cls.teacher_id === userId) {
                    await this.messagesRepository.removeOne(id);
                    return { deleted: true };
                }
            }
            throw new ForbiddenException('You do not have permission to delete this message');
        }
        await this.messagesRepository.removeOne(id);
        return { deleted: true };
    }
}
