import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from './entities/content.entity';
import { ContentsController } from './contents.controller';
import { ContentsService } from './contents.service';
import { ContentsRepository } from './repositories/contents.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Content])],
  controllers: [ContentsController],
  providers: [ContentsService, ContentsRepository],
  exports: [ContentsService],
})
export class ContentsModule {}
