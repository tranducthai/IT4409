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
        return this.repo.findOne({
            where: { id },
            relations: { files: true, student: true },
            select: {
                id: true,
                assignment_id: true,
                student_id: true,
                content: true,
                file_url: true,
                score: true,
                feedback: true,
                submitted_at: true,
                files: {
                    id: true,
                    submission_id: true,
                    file_url: true,
                    original_name: true,
                    file_name: true,
                    mime_type: true,
                    size: true,
                    uploaded_at: true,
                },
                student: {
                    id: true,
                    full_name: true,
                    avatar_url: true,
                },
            },
        });
    }

    findManyByAssignmentId(assignment_id: string) {
        return this.repo.find({ where: { assignment_id }, order: { submitted_at: 'DESC' } });
    }

    findManyByAssignmentIdWithFiles(assignment_id: string) {
        return this.repo.find({
            where: { assignment_id },
            relations: { files: true, student: true },
            select: {
                id: true,
                assignment_id: true,
                student_id: true,
                content: true,
                file_url: true,
                score: true,
                feedback: true,
                submitted_at: true,
                files: {
                    id: true,
                    submission_id: true,
                    file_url: true,
                    original_name: true,
                    file_name: true,
                    mime_type: true,
                    size: true,
                    uploaded_at: true,
                },
                student: {
                    id: true,
                    full_name: true,
                    avatar_url: true,
                },
            },
            order: { submitted_at: 'DESC' },
        });
    }

    findManyByAssignmentAndStudent(assignment_id: string, student_id: string) {
        return this.repo.find({
            where: { assignment_id, student_id },
            relations: { files: true, student: true },
            select: {
                id: true,
                assignment_id: true,
                student_id: true,
                content: true,
                file_url: true,
                score: true,
                feedback: true,
                submitted_at: true,
                files: {
                    id: true,
                    submission_id: true,
                    file_url: true,
                    original_name: true,
                    file_name: true,
                    mime_type: true,
                    size: true,
                    uploaded_at: true,
                },
                student: {
                    id: true,
                    full_name: true,
                    avatar_url: true,
                },
            },
            order: { submitted_at: 'DESC' },
        });
    }

    async countDistinctStudentsByAssignmentIds(assignmentIds: string[]) {
        if (!assignmentIds.length) return [] as { assignment_id: string; submitted_count: number }[];

        return this.repo
            .createQueryBuilder('submission')
            .select('submission.assignment_id', 'assignment_id')
            .addSelect('COUNT(DISTINCT submission.student_id)', 'submitted_count')
            .where('submission.assignment_id IN (:...assignmentIds)', { assignmentIds })
            .groupBy('submission.assignment_id')
            .getRawMany();
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
