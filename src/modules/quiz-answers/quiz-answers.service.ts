import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuizAnswerDto } from './dtos/create-quiz-answer.dto';
import { UpdateQuizAnswerDto } from './dtos/update-quiz-answer.dto';
import { QuizAnswersRepository } from './repositories/quiz-answers.repository';

@Injectable()
export class QuizAnswersService {
  constructor(private readonly quizAnswersRepository: QuizAnswersRepository) {}

  create(dto: CreateQuizAnswerDto) {
    return this.quizAnswersRepository.createOne(dto);
  }

  findAll() {
    return this.quizAnswersRepository.findAll();
  }

  async findOne(id: number) {
    const item = await this.quizAnswersRepository.findById(id);
    if (!item) throw new NotFoundException('QuizAnswer not found');
    return item;
  }

  async update(id: number, dto: UpdateQuizAnswerDto) {
    const existing = await this.quizAnswersRepository.findById(id);
    if (!existing) throw new NotFoundException('QuizAnswer not found');
    return this.quizAnswersRepository.updateOne(id, dto);
  }

  async remove(id: number) {
    const existing = await this.quizAnswersRepository.findById(id);
    if (!existing) throw new NotFoundException('QuizAnswer not found');
    await this.quizAnswersRepository.removeOne(id);
    return { deleted: true };
  }
}
