import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Week } from './entities/week.entity';
import { WeeksController } from './weeks.controller';
import { WeeksService } from './weeks.service';
import { WeeksRepository } from './repositories/weeks.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Week])],
  controllers: [WeeksController],
  providers: [WeeksService, WeeksRepository],
  exports: [WeeksService],
})
export class WeeksModule {}
