import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssignmentDto } from './dtos/create-assignment.dto';
import { UpdateAssignmentDto } from './dtos/update-assignment.dto';
import { AssignmentsRepository } from './repositories/assignments.repository';

@Injectable()
export class AssignmentsService {
    constructor(private readonly assignmentsRepository: AssignmentsRepository) { }

    create(dto: CreateAssignmentDto) {
        return this.assignmentsRepository.createOne({
            class_id: dto.class_id,
            created_by: dto.created_by,
            title: dto.title,
            description: dto.description ?? null,
            due_date: dto.due_date ? new Date(dto.due_date) : null,
        });
    }

    findAll() {
        return this.assignmentsRepository.findAll();
    }

    async findOne(id: string) {
        const item = await this.assignmentsRepository.findById(id);
        if (!item) throw new NotFoundException('Assignment not found');
        return item;
    }

    async update(id: string, dto: UpdateAssignmentDto) {
        const existing = await this.assignmentsRepository.findById(id);
        if (!existing) throw new NotFoundException('Assignment not found');

        return this.assignmentsRepository.updateOne(id, {
            ...dto,
            description:
                dto.description === undefined ? undefined : (dto.description ?? null),
            due_date:
                dto.due_date === undefined
                    ? undefined
                    : dto.due_date
                        ? new Date(dto.due_date)
                        : null,
        });
    }

    async remove(id: string) {
        const existing = await this.assignmentsRepository.findById(id);
        if (!existing) throw new NotFoundException('Assignment not found');
        await this.assignmentsRepository.removeOne(id);
        return { deleted: true };
    }
}
