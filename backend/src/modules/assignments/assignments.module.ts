import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { Assignment } from './entities/assignment.entity';
import { AssignmentsRepository } from './repositories/assignments.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Assignment])],
    controllers: [AssignmentsController],
    providers: [AssignmentsService, AssignmentsRepository],
    exports: [AssignmentsService],
})
export class AssignmentsModule { }
