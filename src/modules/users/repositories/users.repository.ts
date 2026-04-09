import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.repo.find();
  }

  findById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  createOne(data: Partial<User>): Promise<User> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async updateOne(id: number, data: Partial<User>): Promise<User | null> {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  async removeOne(id: number): Promise<void> {
    await this.repo.delete({ id });
  }
}
