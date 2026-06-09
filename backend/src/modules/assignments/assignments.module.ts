import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesModule } from '../classes/classes.module';
import { ClassMembersModule } from '../class-members/class-members.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { AssignmentAttachment } from './entities/assignment-attachment.entity';
import { Assignment } from './entities/assignment.entity';
import { AssignmentAttachmentsRepository } from './repositories/assignment-attachments.repository';
import { AssignmentsRepository } from './repositories/assignments.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Assignment, AssignmentAttachment]), ClassesModule, ClassMembersModule, NotificationsModule],
    controllers: [AssignmentsController],
    providers: [AssignmentsService, AssignmentsRepository, AssignmentAttachmentsRepository],
    exports: [AssignmentsService],
})
export class AssignmentsModule { }
