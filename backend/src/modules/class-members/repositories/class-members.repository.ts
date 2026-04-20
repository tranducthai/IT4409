import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassMember } from '../entities/class-member.entity';
import { ClassMemberRole } from '../enums/class-member-role.enum';
import { ClassMemberStatus } from '../enums/class-member-status.enum';

@Injectable()
export class ClassMembersRepository {
  constructor(
    @InjectRepository(ClassMember)
    private readonly repo: Repository<ClassMember>,
  ) { }

  findAll() {
    return this.repo.find();
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  findByIdWithClass(id: string) {
    return this.repo.findOne({ where: { id }, relations: { class: true } });
  }

  findOneByClassAndUser(class_id: string, user_id: string) {
    return this.repo.findOne({ where: { class_id, user_id } });
  }

  findManyByUserRoleStatus(
    user_id: string,
    role: ClassMemberRole,
    status?: ClassMemberStatus,
  ) {
    return this.repo.find({
      where: {
        user_id,
        role,
        ...(status ? { status } : {}),
      },
      relations: { class: true },
      order: { joined_at: 'DESC' },
    });
  }

  findPendingRequestsByClassId(class_id: string) {
    return this.repo
      .createQueryBuilder('cm')
      .leftJoinAndSelect('cm.user', 'user')
      .where('cm.class_id = :class_id', { class_id })
      .andWhere('cm.role = :role', { role: ClassMemberRole.Student })
      .andWhere('cm.status = :status', { status: ClassMemberStatus.Pending })
      .select([
        'cm.id',
        'cm.class_id',
        'cm.user_id',
        'cm.role',
        'cm.status',
        'cm.joined_at',
        'user.id',
        'user.full_name',
        'user.email',
        'user.role',
        'user.avatar_url',
        'user.created_at',
        'user.updated_at',
      ])
      .orderBy('cm.joined_at', 'DESC')
      .getMany();
  }

  createOne(data: Partial<ClassMember>) {
    return this.repo.save(this.repo.create(data));
  }

  async updateOne(id: string, data: Partial<ClassMember>) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  async removeOne(id: string) {
    await this.repo.delete({ id });
  }
}
