import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassMember } from '../class-members/entities/class-member.entity';
import { Class } from '../classes/entities/class.entity';
import { ClassResourceFolder } from './class-resource-folder.entity';
import { ClassResource } from './class-resource.entity';
import { ClassResourcesController } from './class-resources.controller';
import { ClassResourcesRepository } from './class-resources.repository';
import { ClassResourcesService } from './class-resources.service';

@Module({
    imports: [TypeOrmModule.forFeature([ClassResource, ClassResourceFolder])],
    controllers: [ClassResourcesController],
    providers: [ClassResourcesService, ClassResourcesRepository],
})
export class ClassResourcesModule { }

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Class,
            ClassMember,
            ClassResource,
            ClassResourceFolder,
        ]),
    ],
    controllers: [ClassResourcesController],
    providers: [ClassResourcesService],
})
export class ClassResourcesModule { }
