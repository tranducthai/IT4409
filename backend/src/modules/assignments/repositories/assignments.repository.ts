import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from '../entities/assignment.entity';

@Injectable()
export class AssignmentsRepository {
    constructor(
        @InjectRepository(Assignment)
        private readonly repo: Repository<Assignment>,
    ) { }

    findAll() {
        return this.repo.find();
    }

    findById(id: string) {
        return this.repo.findOne({ where: { id } });
    }

    createOne(data: Partial<Assignment>) {
        return this.repo.save(this.repo.create(data));
    }

    async updateOne(id: string, data: Partial<Assignment>) {
        await this.repo.update({ id }, data);
        return this.findById(id);
    }

    async removeOne(id: string) {
        await this.repo.delete({ id });
    }
}
