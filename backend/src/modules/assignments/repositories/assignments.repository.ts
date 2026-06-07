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
        return this.repo.find({ relations: { attachments: true } });
    }

    findById(id: string) {
        return this.repo.findOne({
            where: { id },
            relations: { attachments: true },
        });
    }

    findByIdWithAttachments(id: string) {
        return this.repo.findOne({
            where: { id },
            relations: { attachments: true },
        });
    }

    findManyByClassId(class_id: string) {
        return this.repo.find({
            where: { class_id },
            relations: { attachments: true },
            order: { created_at: 'DESC' },
        });
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
