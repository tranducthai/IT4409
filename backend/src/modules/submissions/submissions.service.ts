import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubmissionDto } from './dtos/create-submission.dto';
import { UpdateSubmissionDto } from './dtos/update-submission.dto';
import { SubmissionsRepository } from './repositories/submissions.repository';

@Injectable()
export class SubmissionsService {
    constructor(private readonly submissionsRepository: SubmissionsRepository) { }

    create(dto: CreateSubmissionDto) {
        return this.submissionsRepository.createOne({
            assignment_id: dto.assignment_id,
            student_id: dto.student_id,
            content: dto.content ?? null,
            file_url: dto.file_url ?? null,
            score: dto.score ?? null,
            feedback: dto.feedback ?? null,
        });
    }

    findAll() {
        return this.submissionsRepository.findAll();
    }

    async findOne(id: string) {
        const item = await this.submissionsRepository.findById(id);
        if (!item) throw new NotFoundException('Submission not found');
        return item;
    }

    async update(id: string, dto: UpdateSubmissionDto) {
        const existing = await this.submissionsRepository.findById(id);
        if (!existing) throw new NotFoundException('Submission not found');

        return this.submissionsRepository.updateOne(id, {
            ...dto,
            content: dto.content === undefined ? undefined : (dto.content ?? null),
            file_url: dto.file_url === undefined ? undefined : (dto.file_url ?? null),
            feedback: dto.feedback === undefined ? undefined : (dto.feedback ?? null),
            score: dto.score === undefined ? undefined : (dto.score ?? null),
        });
    }

    async remove(id: string) {
        const existing = await this.submissionsRepository.findById(id);
        if (!existing) throw new NotFoundException('Submission not found');
        await this.submissionsRepository.removeOne(id);
        return { deleted: true };
    }
}
