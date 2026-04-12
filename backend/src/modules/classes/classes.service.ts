import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClassDto } from './dtos/create-class.dto';
import { UpdateClassDto } from './dtos/update-class.dto';
import { ClassesRepository } from './repositories/classes.repository';

@Injectable()
export class ClassesService {
  constructor(private readonly classesRepository: ClassesRepository) {}

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
}
