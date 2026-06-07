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

    findByDiscussionId(discussion_id: string) {
        return this.repo
            .createQueryBuilder('m')
            .leftJoin('m.author', 'author')
            .where('m.discussion_id = :discussion_id', { discussion_id })
            .select([
                'm.id',
                'm.discussion_id',
                'm.user_id',
                'm.content',
                'm.image_url',
                'm.created_at',
                'author.id',
                'author.full_name',
                'author.avatar_url',
                'author.role',
            ])
            .orderBy('m.created_at', 'ASC')
            .getMany();
    }

    findByIdWithAuthor(id: string) {
        return this.repo
            .createQueryBuilder('m')
            .leftJoin('m.author', 'author')
            .where('m.id = :id', { id })
            .select([
                'm.id', 'm.discussion_id', 'm.user_id', 'm.content', 'm.image_url', 'm.created_at',
                'author.id', 'author.full_name', 'author.avatar_url', 'author.role',
            ])
            .getOne();
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
