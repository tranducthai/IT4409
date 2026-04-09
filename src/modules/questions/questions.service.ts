import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuestionDto } from './dtos/create-question.dto';
import { UpdateQuestionDto } from './dtos/update-question.dto';
import { QuestionsRepository } from './repositories/questions.repository';

@Injectable()
export class QuestionsService {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  create(dto: CreateQuestionDto) {
    return this.questionsRepository.createOne(dto);
  }

  findAll() {
    return this.questionsRepository.findAll();
  }

  async findOne(id: number) {
    const item = await this.questionsRepository.findById(id);
    if (!item) throw new NotFoundException('Question not found');
    return item;
  }

  async update(id: number, dto: UpdateQuestionDto) {
    const existing = await this.questionsRepository.findById(id);
    if (!existing) throw new NotFoundException('Question not found');
    return this.questionsRepository.updateOne(id, dto);
  }

  async remove(id: number) {
    const existing = await this.questionsRepository.findById(id);
    if (!existing) throw new NotFoundException('Question not found');
    await this.questionsRepository.removeOne(id);
    return { deleted: true };
  }
}
