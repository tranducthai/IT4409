import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassMember } from '../class-members/entities/class-member.entity';
import { Class } from '../classes/entities/class.entity';
import { ClassResourcesController } from './class-resources.controller';
import { ClassResourcesService } from './class-resources.service';
import { ClassResourceFolder } from './entities/class-resource-folder.entity';
import { ClassResource } from './entities/class-resource.entity';

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
export class ClassResourcesModule {}
