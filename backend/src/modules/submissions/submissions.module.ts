import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentsModule } from '../assignments/assignments.module';
import { ClassMembersModule } from '../class-members/class-members.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SubmissionFile } from './entities/submission-file.entity';
import { Submission } from './entities/submission.entity';
import { SubmissionFilesRepository } from './repositories/submission-files.repository';
import { SubmissionsRepository } from './repositories/submissions.repository';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Submission, SubmissionFile]),
        AssignmentsModule,
        ClassMembersModule,
        NotificationsModule,
    ],
    controllers: [SubmissionsController],
    providers: [SubmissionsService, SubmissionsRepository, SubmissionFilesRepository],
    exports: [SubmissionsService],
})
export class SubmissionsModule { }
