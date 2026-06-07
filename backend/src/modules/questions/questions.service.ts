import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ClassesRepository } from '../classes/repositories/classes.repository';
import { QuizzesRepository } from '../quizzes/repositories/quizzes.repository';
import { CreateQuestionDto } from './dtos/create-question.dto';
import { CreateQuestionsBulkDto } from './dtos/create-questions-bulk.dto';
import { UpdateQuestionDto } from './dtos/update-question.dto';
import { QuestionsRepository } from './repositories/questions.repository';

@Injectable()
export class QuestionsService {
  constructor(
    private readonly questionsRepository: QuestionsRepository,
    private readonly quizzesRepository: QuizzesRepository,
    private readonly classesRepository: ClassesRepository,
  ) { }

  private async ensureTeacherOwnsQuiz(teacherId: string, quizId: string) {
    const quiz = await this.quizzesRepository.findById(quizId);
    if (!quiz) throw new NotFoundException('Quiz not found');
    const cls = await this.classesRepository.findById(quiz.class_id);
    if (!cls) throw new NotFoundException('Class not found');
    if (cls.teacher_id !== teacherId) {
      throw new ForbiddenException('Class not owned by teacher');
    }
    return quiz;
  }

  async create(teacherId: string, dto: CreateQuestionDto) {
    await this.ensureTeacherOwnsQuiz(teacherId, dto.quiz_id);
    return this.questionsRepository.createOne(dto);
  }

  async createMany(teacherId: string, dto: CreateQuestionsBulkDto) {
    await this.ensureTeacherOwnsQuiz(teacherId, dto.quiz_id);
    const created = await Promise.all(
      dto.questions.map((q) =>
        this.questionsRepository.createOne({ ...q, quiz_id: dto.quiz_id }),
      ),
    );
    return created;
  }

  findAll() {
    return this.questionsRepository.findAll();
  }

  async findByQuizId(teacherId: string, quizId: string) {
    await this.ensureTeacherOwnsQuiz(teacherId, quizId);
    return this.questionsRepository.findByQuizId(quizId);
  }

  async findOne(id: string) {
    const item = await this.questionsRepository.findById(id);
    if (!item) throw new NotFoundException('Question not found');
    return item;
  }

  async update(teacherId: string, id: string, dto: UpdateQuestionDto) {
    const existing = await this.questionsRepository.findById(id);
    if (!existing) throw new NotFoundException('Question not found');
    await this.ensureTeacherOwnsQuiz(teacherId, existing.quiz_id);
    return this.questionsRepository.updateOne(id, dto);
  }

  async remove(teacherId: string, id: string) {
    const existing = await this.questionsRepository.findById(id);
    if (!existing) throw new NotFoundException('Question not found');
    await this.ensureTeacherOwnsQuiz(teacherId, existing.quiz_id);
    await this.questionsRepository.removeOne(id);
    return { deleted: true };
  }
}
