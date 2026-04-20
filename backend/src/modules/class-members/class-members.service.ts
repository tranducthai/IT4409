import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Class } from '../classes/entities/class.entity';
import { ClassesRepository } from '../classes/repositories/classes.repository';
import { CreateClassMemberDto } from './dtos/create-class-member.dto';
import { RequestJoinClassDto } from './dtos/request-join-class.dto';
import { UpdateClassMemberDto } from './dtos/update-class-member.dto';
import { ClassMember } from './entities/class-member.entity';
import { ClassMemberRole } from './enums/class-member-role.enum';
import { ClassMemberStatus } from './enums/class-member-status.enum';
import { ClassMembersRepository } from './repositories/class-members.repository';

@Injectable()
export class ClassMembersService {
  constructor(
    private readonly classMembersRepository: ClassMembersRepository,
    private readonly classesRepository: ClassesRepository,
  ) { }

  create(dto: CreateClassMemberDto) {
    const payload: Partial<ClassMember> = {
      class_id: dto.class_id,
      user_id: dto.user_id,
      role: dto.role,
      status: dto.status,
      joined_at: dto.joined_at ? new Date(dto.joined_at) : new Date(),
    };
    return this.classMembersRepository.createOne(payload);
  }

  findAll() {
    return this.classMembersRepository.findAll();
  }

  async findOne(id: string) {
    const item = await this.classMembersRepository.findById(id);
    if (!item) throw new NotFoundException('ClassMember not found');
    return item;
  }

  async update(id: string, dto: UpdateClassMemberDto) {
    const existing = await this.classMembersRepository.findById(id);
    if (!existing) throw new NotFoundException('ClassMember not found');
    const payload: Partial<ClassMember> = {};
    if (dto.class_id !== undefined) payload.class_id = dto.class_id;
    if (dto.user_id !== undefined) payload.user_id = dto.user_id;
    if (dto.role !== undefined) payload.role = dto.role;
    if (dto.status !== undefined) payload.status = dto.status;
    if (dto.joined_at !== undefined)
      payload.joined_at = new Date(dto.joined_at);
    return this.classMembersRepository.updateOne(id, payload);
  }

  async remove(id: string) {
    const existing = await this.classMembersRepository.findById(id);
    if (!existing) throw new NotFoundException('ClassMember not found');
    await this.classMembersRepository.removeOne(id);
    return { deleted: true };
  }

  listTeacherClasses(teacherId: string): Promise<Class[]> {
    return this.classesRepository.findManyByTeacherId(teacherId);
  }

  listStudentClasses(studentId: string): Promise<Class[]> {
    return this.classMembersRepository
      .findManyByUserRoleStatus(
        studentId,
        ClassMemberRole.Student,
        ClassMemberStatus.Active,
      )
      .then((members) => members.map((m) => m.class));
  }

  async requestJoinClass(
    studentId: string,
    dto: RequestJoinClassDto,
  ): Promise<ClassMember> {
    const cls = await this.classesRepository.findById(dto.class_id);
    if (!cls) throw new NotFoundException('Class not found');
    if (!cls.is_active) throw new ConflictException('Class is inactive');

    const existing = await this.classMembersRepository.findOneByClassAndUser(
      dto.class_id,
      studentId,
    );
    if (existing) throw new ConflictException('Already requested or joined');

    const payload: Partial<ClassMember> = {
      class_id: dto.class_id,
      user_id: studentId,
      role: ClassMemberRole.Student,
      status: ClassMemberStatus.Pending,
      joined_at: new Date(),
    };

    return this.classMembersRepository.createOne(payload);
  }

  async approveJoinRequest(
    teacherId: string,
    classMemberId: string,
  ): Promise<ClassMember | null> {
    const member = await this.classMembersRepository.findByIdWithClass(
      classMemberId,
    );
    if (!member) throw new NotFoundException('ClassMember not found');

    if (member.role !== ClassMemberRole.Student) {
      throw new ConflictException('Only student requests can be approved');
    }

    if (member.status !== ClassMemberStatus.Pending) {
      throw new ConflictException('Request is not pending');
    }

    if (!member.class || member.class.teacher_id !== teacherId) {
      throw new NotFoundException('Class not found');
    }

    return this.classMembersRepository.updateOne(classMemberId, {
      status: ClassMemberStatus.Active,
      joined_at: new Date(),
    });
  }

  async listPendingRequests(teacherId: string, classId: string) {
    const cls = await this.classesRepository.findById(classId);
    if (!cls || cls.teacher_id !== teacherId) {
      throw new NotFoundException('Class not found');
    }

    return this.classMembersRepository.findPendingRequestsByClassId(classId);
  }
}
