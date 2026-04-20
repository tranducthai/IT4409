import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from '../classes/entities/class.entity';
import { ClassesRepository } from '../classes/repositories/classes.repository';
import { ClassMembersController } from './class-members.controller';
import { ClassMembersService } from './class-members.service';
import { ClassMember } from './entities/class-member.entity';
import { ClassMembersRepository } from './repositories/class-members.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ClassMember, Class])],
  controllers: [ClassMembersController],
  providers: [ClassMembersService, ClassMembersRepository, ClassesRepository],
  exports: [ClassMembersService],
})
export class ClassMembersModule { }
