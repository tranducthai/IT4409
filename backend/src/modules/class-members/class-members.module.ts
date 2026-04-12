import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassMember } from './entities/class-member.entity';
import { ClassMembersController } from './class-members.controller';
import { ClassMembersService } from './class-members.service';
import { ClassMembersRepository } from './repositories/class-members.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ClassMember])],
  controllers: [ClassMembersController],
  providers: [ClassMembersService, ClassMembersRepository],
  exports: [ClassMembersService],
})
export class ClassMembersModule {}
