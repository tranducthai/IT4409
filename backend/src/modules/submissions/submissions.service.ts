import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { AssignmentsService } from '../assignments/assignments.service';
import { ClassMembersService } from '../class-members/class-members.service';
import { CreateSubmissionDto } from './dtos/create-submission.dto';
import { SubmitAssignmentDto } from './dtos/submit-assignment.dto';
import { UpdateSubmissionDto } from './dtos/update-submission.dto';
import { SubmissionFilesRepository } from './repositories/submission-files.repository';
import { SubmissionsRepository } from './repositories/submissions.repository';

@Injectable()
export class SubmissionsService {
    constructor(
        private readonly submissionsRepository: SubmissionsRepository,
        private readonly submissionFilesRepository: SubmissionFilesRepository,
        private readonly assignmentsService: AssignmentsService,
        private readonly classMembersService: ClassMembersService,
    ) { }

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
        const item = await this.submissionsRepository.findByIdWithFiles(id);
        if (!item) throw new NotFoundException('Submission not found');
        return item;
    }

    async submit(
        assignmentId: string,
        studentId: string,
        dto: SubmitAssignmentDto,
        files: {
            file_url: string;
            original_name: string;
            file_name: string;
            mime_type: string;
            size: number;
        }[] = [],
    ) {
        if (files.length > 10) {
            throw new BadRequestException('Maximum 10 files allowed');
        }

        const assignment = await this.assignmentsService.findOne(assignmentId);
        await this.classMembersService.ensureActiveStudent(
            assignment.class_id,
            studentId,
        );

        if (assignment.due_date && new Date() > new Date(assignment.due_date)) {
            throw new ForbiddenException('Assignment is past due');
        }

        const submission = await this.submissionsRepository.createOne({
            assignment_id: assignmentId,
            student_id: studentId,
            content: dto.content ?? null,
            file_url: null,
            score: null,
            feedback: null,
        });

        if (files.length) {
            await this.submissionFilesRepository.createMany(
                files.map((f) => ({ ...f, submission_id: submission.id })),
            );
        }

        return this.submissionsRepository.findByIdWithFiles(submission.id);
    }

    async findByAssignmentForTeacher(assignmentId: string, teacherId: string) {
        const assignment = await this.assignmentsService.findOne(assignmentId);
        if (assignment.created_by !== teacherId) {
            throw new ForbiddenException('Only creator can view submissions');
        }
        return this.submissionsRepository.findManyByAssignmentIdWithFiles(assignmentId);
    }

    async findMyByAssignment(assignmentId: string, studentId: string) {
        const assignment = await this.assignmentsService.findOne(assignmentId);
        await this.classMembersService.ensureActiveStudent(
            assignment.class_id,
            studentId,
        );
        return this.submissionsRepository.findManyByAssignmentAndStudent(
            assignmentId,
            studentId,
        );
    }

    async gradeSubmission(teacherId: string, submissionId: string, score?: number, feedback?: string) {
        const existing = await this.submissionsRepository.findById(submissionId);
        if (!existing) throw new NotFoundException('Submission not found');

        const assignment = await this.assignmentsService.findOne(existing.assignment_id);
        if (assignment.created_by !== teacherId) {
            throw new ForbiddenException('Only creator can grade submissions');
        }

        return this.submissionsRepository.updateOne(submissionId, {
            score: score === undefined ? undefined : score,
            feedback: feedback === undefined ? undefined : feedback,
        });
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
