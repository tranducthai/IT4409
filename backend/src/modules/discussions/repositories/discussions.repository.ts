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

    createOne(data: Partial<Discussion>) {
        return this.repo.save(this.repo.create(data));
    }

    async updateOne(id: string, data: Partial<Discussion>) {
        await this.repo.update({ id }, data);
        return this.findById(id);
    }

    async removeOne(id: string) {
        await this.repo.delete({ id });
    }
}
