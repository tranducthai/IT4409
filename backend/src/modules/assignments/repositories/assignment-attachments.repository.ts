import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssignmentAttachment } from '../entities/assignment-attachment.entity';

@Injectable()
export class AssignmentAttachmentsRepository {
    constructor(
        @InjectRepository(AssignmentAttachment)
        private readonly repo: Repository<AssignmentAttachment>,
    ) { }

    createMany(items: Partial<AssignmentAttachment>[]) {
        if (!items.length) return [];
        return this.repo.save(this.repo.create(items));
    }

    findManyByAssignmentId(assignment_id: string) {
        return this.repo.find({ where: { assignment_id } });
    }
}
