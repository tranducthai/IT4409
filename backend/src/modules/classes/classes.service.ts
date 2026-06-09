import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AssignmentsRepository } from '../assignments/repositories/assignments.repository';
import { ClassMembersRepository } from '../class-members/repositories/class-members.repository';
import { QuizAttemptsRepository } from '../quiz-attempts/repositories/quiz-attempts.repository';
import { QuizzesRepository } from '../quizzes/repositories/quizzes.repository';
import { SubmissionsRepository } from '../submissions/repositories/submissions.repository';
import { CreateClassDto } from './dtos/create-class.dto';
import { UpdateClassDto } from './dtos/update-class.dto';
import { ClassesRepository } from './repositories/classes.repository';

@Injectable()
export class ClassesService {
  constructor(
    private readonly classesRepository: ClassesRepository,
    private readonly classMembersRepository: ClassMembersRepository,
    private readonly assignmentsRepository: AssignmentsRepository,
    private readonly submissionsRepository: SubmissionsRepository,
    private readonly quizzesRepository: QuizzesRepository,
    private readonly quizAttemptsRepository: QuizAttemptsRepository,
  ) { }

  create(dto: CreateClassDto) {
    return this.classesRepository.createOne(dto);
  }

  findAll() {
    return this.classesRepository.findAll();
  }

  async findOne(id: string) {
    const item = await this.classesRepository.findById(id);
    if (!item) throw new NotFoundException('Class not found');
    return item;
  }

  async update(id: string, dto: UpdateClassDto) {
    const existing = await this.classesRepository.findById(id);
    if (!existing) throw new NotFoundException('Class not found');
    return this.classesRepository.updateOne(id, dto);
  }

  async remove(id: string) {
    const existing = await this.classesRepository.findById(id);
    if (!existing) throw new NotFoundException('Class not found');
    await this.classesRepository.removeOne(id);
    return { deleted: true };
  }

  async getTeacherProgress(classId: string, teacherId: string) {
    const cls = await this.classesRepository.findById(classId);
    if (!cls) throw new NotFoundException('Class not found');
    if (cls.teacher_id !== teacherId) {
      throw new ForbiddenException('Only class teacher can view progress');
    }

    const [studentCount, assignments, quizzes] = await Promise.all([
      this.classMembersRepository.countActiveStudentsByClass(classId),
      this.assignmentsRepository.findManyByClassId(classId),
      this.quizzesRepository.findByClassId(classId),
    ]);

    const assignmentIds = assignments.map((item) => item.id);
    const quizIds = quizzes.map((item) => item.id);

    const [assignmentCounts, quizScoresRaw] = await Promise.all([
      this.submissionsRepository.countDistinctStudentsByAssignmentIds(
        assignmentIds,
      ),
      this.quizAttemptsRepository.findBestScoresByQuizIds(quizIds),
    ]);

    const assignmentCountMap = new Map(
      assignmentCounts.map((row) => [
        row.assignment_id,
        Number(row.submitted_count) || 0,
      ]),
    );

    const quizScoresByQuiz = quizScoresRaw.reduce((acc, row) => {
      const list = acc.get(row.quiz_id) ?? [];
      list.push({
        student_id: row.student_id,
        score: row.best_score === null ? null : Number(row.best_score),
        last_end_time: row.last_end_time ?? null,
        student: row.student_full_name
          ? {
            full_name: row.student_full_name,
            avatar_url: row.student_avatar_url ?? null,
          }
          : null,
      });
      acc.set(row.quiz_id, list);
      return acc;
    }, new Map());

    return {
      class_id: classId,
      total_students: studentCount,
      assignments: assignments.map((assignment) => ({
        id: assignment.id,
        title: assignment.title,
        due_date: assignment.due_date ?? null,
        submitted_count: assignmentCountMap.get(assignment.id) ?? 0,
      })),
      quizzes: quizzes.map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        total_questions: quiz.total_questions,
        time_limit: quiz.time_limit,
        scores: quizScoresByQuiz.get(quiz.id) ?? [],
      })),
    };
  }
}
