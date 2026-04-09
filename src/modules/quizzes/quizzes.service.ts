import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuizDto } from './dtos/create-quiz.dto';
import { UpdateQuizDto } from './dtos/update-quiz.dto';
import { QuizzesRepository } from './repositories/quizzes.repository';

@Injectable()
export class QuizzesService {
  constructor(private readonly quizzesRepository: QuizzesRepository) {}

  create(dto: CreateQuizDto) {
    return this.quizzesRepository.createOne(dto);
  }

  findAll() {
    return this.quizzesRepository.findAll();
  }

  async findOne(id: number) {
    const item = await this.quizzesRepository.findById(id);
    if (!item) throw new NotFoundException('Quiz not found');
    return item;
  }

  async update(id: number, dto: UpdateQuizDto) {
    const existing = await this.quizzesRepository.findById(id);
    if (!existing) throw new NotFoundException('Quiz not found');
    return this.quizzesRepository.updateOne(id, dto);
  }

  async remove(id: number) {
    const existing = await this.quizzesRepository.findById(id);
    if (!existing) throw new NotFoundException('Quiz not found');
    await this.quizzesRepository.removeOne(id);
    return { deleted: true };
  }
}
