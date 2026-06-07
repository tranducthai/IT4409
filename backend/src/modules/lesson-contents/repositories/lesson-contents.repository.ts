import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from '../../lessons/entities/lesson.entity';

@Injectable()
export class LessonContentsRepository {
  constructor(
    @InjectRepository(Lesson)
    private readonly repo: Repository<Lesson>,
  ) { }

  findAll() {
    return this.repo.find();
  }

  findManyByClassId(classId: string) {
    return this.repo
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.section', 'section')
      .leftJoinAndSelect('section.class', 'class')
      .where('class.id = :classId', { classId })
      .orderBy('section.order_index', 'ASC')
      .addOrderBy('lesson.order_index', 'ASC')
      .getMany();
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  createOne(data: Partial<Lesson>) {
    return this.repo.save(this.repo.create(data));
  }

  createMany(data: Array<Partial<Lesson>>) {
    return this.repo.save(this.repo.create(data));
  }

  async updateOne(id: number, data: Partial<Lesson>) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  async removeOne(id: number) {
    await this.repo.delete({ id });
  }
}
