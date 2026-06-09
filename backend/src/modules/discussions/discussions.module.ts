import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassMember } from '../class-members/entities/class-member.entity';
import { Class } from '../classes/entities/class.entity';
import { DiscussionsController } from './discussions.controller';
import { DiscussionsService } from './discussions.service';
import { Discussion } from './entities/discussion.entity';
import { DiscussionsRepository } from './repositories/discussions.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Discussion, ClassMember, Class])],
    controllers: [DiscussionsController],
    providers: [DiscussionsService, DiscussionsRepository],
    exports: [DiscussionsService],
})
export class DiscussionsModule { }
