import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ClassesService } from '../classes/classes.service';
import { CreateAssignmentDto } from './dtos/create-assignment.dto';
import { UpdateAssignmentDto } from './dtos/update-assignment.dto';
import { AssignmentAttachmentsRepository } from './repositories/assignment-attachments.repository';
import { AssignmentsRepository } from './repositories/assignments.repository';

@Injectable()
export class AssignmentsService {
    constructor(
        private readonly assignmentsRepository: AssignmentsRepository,
        private readonly assignmentAttachmentsRepository: AssignmentAttachmentsRepository,
        private readonly classesService: ClassesService,
    ) { }

    async create(teacherId: string, dto: CreateAssignmentDto, attachments: {
        file_url: string;
        original_name: string;
        file_name: string;
        mime_type: string;
        size: number;
    }[] = []) {
        const cls = await this.classesService.findOne(dto.class_id);
        if (cls.teacher_id !== teacherId) {
            throw new ForbiddenException('Only class teacher can create assignment');
        }

        const assignment = await this.assignmentsRepository.createOne({
            class_id: dto.class_id,
            created_by: teacherId,
            title: dto.title,
            description: dto.description ?? null,
            due_date: dto.due_date ? new Date(dto.due_date) : null,
        });

        if (attachments.length) {
            await this.assignmentAttachmentsRepository.createMany(
                attachments.map((a) => ({ ...a, assignment_id: assignment.id })),
            );
        }

        return this.assignmentsRepository.findByIdWithAttachments(assignment.id);
    }

    findAll() {
        return this.assignmentsRepository.findAll();
    }

    findByClassId(classId: string) {
        return this.assignmentsRepository.findManyByClassId(classId);
    }

    async findOne(id: string) {
        const item = await this.assignmentsRepository.findByIdWithAttachments(id);
        if (!item) throw new NotFoundException('Assignment not found');
        return item;
    }

    async update(teacherId: string, id: string, dto: UpdateAssignmentDto) {
        const existing = await this.assignmentsRepository.findById(id);
        if (!existing) throw new NotFoundException('Assignment not found');
        if (existing.created_by !== teacherId) {
            throw new ForbiddenException('Only creator can update assignment');
        }

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

    async remove(teacherId: string, id: string) {
        const existing = await this.assignmentsRepository.findById(id);
        if (!existing) throw new NotFoundException('Assignment not found');
        if (existing.created_by !== teacherId) {
            throw new ForbiddenException('Only creator can delete assignment');
        }
        await this.assignmentsRepository.removeOne(id);
        return { deleted: true };
    }
}
