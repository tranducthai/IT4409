import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorProfilesController } from './instructor-profiles.controller';
import { InstructorProfilesService } from './instructor-profiles.service';
import { TeacherProfile } from './entities/instructor-profile.entity';
import { InstructorProfilesRepository } from './repositories/instructor-profiles.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TeacherProfile])],
  controllers: [InstructorProfilesController],
  providers: [InstructorProfilesService, InstructorProfilesRepository],
  exports: [InstructorProfilesService],
})
export class InstructorProfilesModule {}
