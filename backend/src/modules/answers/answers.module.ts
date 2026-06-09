import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from './entities/answer.entity';
import { AnswersController } from './answers.controller';
import { AnswersService } from './answers.service';
import { AnswersRepository } from './repositories/answers.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Answer])],
  controllers: [AnswersController],
  providers: [AnswersService, AnswersRepository],
  exports: [AnswersService],
})
export class AnswersModule {}
