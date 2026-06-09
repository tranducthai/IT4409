import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubmissionFile } from '../entities/submission-file.entity';

@Injectable()
export class SubmissionFilesRepository {
    constructor(
        @InjectRepository(SubmissionFile)
        private readonly repo: Repository<SubmissionFile>,
    ) { }

    createMany(items: Partial<SubmissionFile>[]) {
        if (!items.length) return [];
        return this.repo.save(this.repo.create(items));
    }

    findManyBySubmissionId(submission_id: string) {
        return this.repo.find({ where: { submission_id } });
    }
}
