import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentProfilesController } from './student-profiles.controller';
import { StudentProfilesService } from './student-profiles.service';
import { StudentProfile } from './entities/student-profile.entity';
import { StudentProfilesRepository } from './repositories/student-profiles.repository';

@Module({
  imports: [TypeOrmModule.forFeature([StudentProfile])],
  controllers: [StudentProfilesController],
  providers: [StudentProfilesService, StudentProfilesRepository],
  exports: [StudentProfilesService],
})
export class StudentProfilesModule {}
