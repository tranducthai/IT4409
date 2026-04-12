import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';

@Injectable()
export class MessagesRepository {
    constructor(
        @InjectRepository(Message)
        private readonly repo: Repository<Message>,
    ) { }

    findAll() {
        return this.repo.find();
    }

    findById(id: string) {
        return this.repo.findOne({ where: { id } });
    }

    createOne(data: Partial<Message>) {
        return this.repo.save(this.repo.create(data));
    }

    async updateOne(id: string, data: Partial<Message>) {
        await this.repo.update({ id }, data);
        return this.findById(id);
    }

    async removeOne(id: string) {
        await this.repo.delete({ id });
    }
}
