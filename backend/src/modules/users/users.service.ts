import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersRepository } from './repositories/users.repository';
import { User } from './entities/user.entity';

export type SafeUser = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  sanitize(user: User): SafeUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safe } = user;
    return safe;
  }

  async create(dto: CreateUserDto): Promise<SafeUser> {
    const hashed = await bcrypt.hash(dto.password, 10);
    const created = await this.usersRepository.createOne({
      ...dto,
      password: hashed,
    });
    return this.sanitize(created);
  }

  async findAll(): Promise<SafeUser[]> {
    const users = await this.usersRepository.findAll();
    return users.map((u) => this.sanitize(u));
  }

  async findOne(id: string): Promise<SafeUser> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<SafeUser> {
    const existing = await this.usersRepository.findById(id);
    if (!existing) throw new NotFoundException('User not found');

    const patch: Partial<User> = {};
    if (dto.full_name !== undefined) patch.full_name = dto.full_name;
    if (dto.email !== undefined) patch.email = dto.email;
    if (dto.role !== undefined) patch.role = dto.role;
    if (dto.avatar_url !== undefined) patch.avatar_url = dto.avatar_url;
    if (dto.password) patch.password = await bcrypt.hash(dto.password, 10);

    const updated = await this.usersRepository.updateOne(id, patch);
    if (!updated) throw new NotFoundException('User not found');
    return this.sanitize(updated);
  }

  async remove(id: string) {
    const existing = await this.usersRepository.findById(id);
    if (!existing) throw new NotFoundException('User not found');
    await this.usersRepository.removeOne(id);
    return { deleted: true };
  }
}
