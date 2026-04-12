import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from './dtos/create-message.dto';
import { UpdateMessageDto } from './dtos/update-message.dto';
import { MessagesRepository } from './repositories/messages.repository';

@Injectable()
export class MessagesService {
    constructor(private readonly messagesRepository: MessagesRepository) { }

    create(dto: CreateMessageDto) {
        return this.messagesRepository.createOne(dto);
    }

    findAll() {
        return this.messagesRepository.findAll();
    }

    async findOne(id: string) {
        const item = await this.messagesRepository.findById(id);
        if (!item) throw new NotFoundException('Message not found');
        return item;
    }

    async update(id: string, dto: UpdateMessageDto) {
        const existing = await this.messagesRepository.findById(id);
        if (!existing) throw new NotFoundException('Message not found');
        return this.messagesRepository.updateOne(id, dto);
    }

    async remove(id: string) {
        const existing = await this.messagesRepository.findById(id);
        if (!existing) throw new NotFoundException('Message not found');
        await this.messagesRepository.removeOne(id);
        return { deleted: true };
    }
}
