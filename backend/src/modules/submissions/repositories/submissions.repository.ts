import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from '../entities/submission.entity';

@Injectable()
export class SubmissionsRepository {
    constructor(
        @InjectRepository(Submission)
        private readonly repo: Repository<Submission>,
    ) { }

    findAll() {
        return this.repo.find();
    }

    findById(id: string) {
        return this.repo.findOne({ where: { id } });
    }

    findByIdWithFiles(id: string) {
        return this.repo.findOne({ where: { id }, relations: { files: true } });
    }

    findManyByAssignmentId(assignment_id: string) {
        return this.repo.find({ where: { assignment_id }, order: { submitted_at: 'DESC' } });
    }

    createOne(data: Partial<Submission>) {
        return this.repo.save(this.repo.create(data));
    }

    async updateOne(id: string, data: Partial<Submission>) {
        await this.repo.update({ id }, data);
        return this.findById(id);
    }

    async removeOne(id: string) {
        await this.repo.delete({ id });
    }
}
