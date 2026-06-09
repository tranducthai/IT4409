import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discussion } from '../entities/discussion.entity';

@Injectable()
export class DiscussionsRepository {
    constructor(
        @InjectRepository(Discussion)
        private readonly repo: Repository<Discussion>,
    ) { }

    findAll() {
        return this.repo.find();
    }

    findById(id: string) {
        return this.repo.findOne({ where: { id } });
    }

    findByIdWithAuthor(id: string) {
        return this.repo
            .createQueryBuilder('d')
            .leftJoin('d.author', 'author')
            .where('d.id = :id', { id })
            .select([
                'd.id',
                'd.class_id',
                'd.created_by',
                'd.title',
                'd.content',
                'd.created_at',
                'author.id',
                'author.full_name',
                'author.avatar_url',
                'author.role',
            ])
            .getOne();
    }

    findByClassId(class_id: string) {
        return this.repo
            .createQueryBuilder('d')
            .leftJoin('d.author', 'author')
            .where('d.class_id = :class_id', { class_id })
            .select([
                'd.id',
                'd.class_id',
                'd.created_by',
                'd.title',
                'd.content',
                'd.created_at',
                'author.id',
                'author.full_name',
                'author.avatar_url',
                'author.role',
            ])
            .orderBy('d.created_at', 'DESC')
            .getMany();
    }

    createOne(data: Partial<Discussion>) {
        return this.repo.save(this.repo.create(data));
    }

    async updateOne(id: string, data: Partial<Discussion>) {
        await this.repo.update({ id }, data);
        return this.findByIdWithAuthor(id);
    }

    async removeOne(id: string) {
        await this.repo.delete({ id });
    }
}
