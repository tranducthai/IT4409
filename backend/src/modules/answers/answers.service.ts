import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnswerDto } from './dtos/create-answer.dto';
import { UpdateAnswerDto } from './dtos/update-answer.dto';
import { AnswersRepository } from './repositories/answers.repository';

@Injectable()
export class AnswersService {
  constructor(private readonly answersRepository: AnswersRepository) {}

  create(dto: CreateAnswerDto) {
    return this.answersRepository.createOne(dto);
  }

  findAll() {
    return this.answersRepository.findAll();
  }

  async findOne(id: number) {
    const item = await this.answersRepository.findById(id);
    if (!item) throw new NotFoundException('Answer not found');
    return item;
  }

  async update(id: number, dto: UpdateAnswerDto) {
    const existing = await this.answersRepository.findById(id);
    if (!existing) throw new NotFoundException('Answer not found');
    return this.answersRepository.updateOne(id, dto);
  }

  async remove(id: number) {
    const existing = await this.answersRepository.findById(id);
    if (!existing) throw new NotFoundException('Answer not found');
    await this.answersRepository.removeOne(id);
    return { deleted: true };
  }
}
