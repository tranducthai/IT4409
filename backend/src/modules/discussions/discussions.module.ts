import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscussionsController } from './discussions.controller';
import { DiscussionsService } from './discussions.service';
import { Discussion } from './entities/discussion.entity';
import { DiscussionsRepository } from './repositories/discussions.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Discussion])],
    controllers: [DiscussionsController],
    providers: [DiscussionsService, DiscussionsRepository],
    exports: [DiscussionsService],
})
export class DiscussionsModule { }
