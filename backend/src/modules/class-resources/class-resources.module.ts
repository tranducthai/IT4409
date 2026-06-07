import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
