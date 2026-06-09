import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from '../classes/entities/class.entity';
import { ClassesRepository } from '../classes/repositories/classes.repository';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { StudentProfile } from '../student-profiles/entities/student-profile.entity';
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
    @InjectRepository(StudentProfile)
    private readonly studentProfileRepo: Repository<StudentProfile>,
    private readonly notificationsService: NotificationsService,
  ) { }

  // ── Teacher: add student directly by user UUID (legacy) ───────────────────
  async create(requesterId: string, dto: CreateClassMemberDto) {
    const cls = await this.classesRepository.findById(dto.class_id);
    if (!cls) throw new NotFoundException('Class not found');
    if (cls.teacher_id !== requesterId) {
      throw new ForbiddenException('You can only add students to your own classes');
    }
    if (!cls.is_active) throw new ConflictException('Class is inactive');

    const existing = await this.classMembersRepository.findOneByClassAndUser(dto.class_id, dto.user_id);
    if (existing) throw new ConflictException('Already requested or joined');

    return this.classMembersRepository.createOne({
      class_id: dto.class_id,
      user_id: dto.user_id,
      role: ClassMemberRole.Student,
      status: ClassMemberStatus.Active,
      joined_at: dto.joined_at ? new Date(dto.joined_at) : new Date(),
    });
  }

  // ── Teacher: add student by MSSV (student_code) ──────────────────────────
  async addStudentByCode(teacherId: string, classId: string, studentCode: string) {
    const cls = await this.classesRepository.findById(classId);
    if (!cls) throw new NotFoundException('Không tìm thấy lớp học');
    if (cls.teacher_id !== teacherId) throw new ForbiddenException('Bạn không phải giảng viên lớp này');
    if (!cls.is_active) throw new ConflictException('Lớp học không còn hoạt động');

    const profile = await this.studentProfileRepo.findOne({
      where: { student_code: studentCode.trim() },
    });
    if (!profile) throw new NotFoundException(`Không tìm thấy sinh viên với MSSV "${studentCode}"`);

    const existing = await this.classMembersRepository.findOneByClassAndUser(classId, profile.user_id);
    if (existing) {
      if (existing.status === ClassMemberStatus.Active) {
        throw new ConflictException('Sinh viên đã ở trong lớp');
      }
      // If pending/rejected, activate directly
      return this.classMembersRepository.updateOne(existing.id, {
        status: ClassMemberStatus.Active,
        joined_at: new Date(),
      });
    }

    return this.classMembersRepository.createOne({
      class_id: classId,
      user_id: profile.user_id,
      role: ClassMemberRole.Student,
      status: ClassMemberStatus.Active,
      joined_at: new Date(),
    });
  }

  // ── Teacher: bulk add students by MSSV list ──────────────────────────────
  async bulkAddStudentsByCodes(teacherId: string, classId: string, studentCodes: string[]) {
    const cls = await this.classesRepository.findById(classId);
    if (!cls) throw new NotFoundException('Không tìm thấy lớp học');
    if (cls.teacher_id !== teacherId) throw new ForbiddenException('Bạn không phải giảng viên lớp này');
    if (!cls.is_active) throw new ConflictException('Lớp học không còn hoạt động');

    const added: string[] = [];
    const alreadyInClass: string[] = [];
    const notFound: string[] = [];

    for (const raw of studentCodes) {
      const code = raw.trim();
      if (!code) continue;

      const profile = await this.studentProfileRepo.findOne({ where: { student_code: code } });
      if (!profile) {
        notFound.push(code);
        continue;
      }

      const existing = await this.classMembersRepository.findOneByClassAndUser(classId, profile.user_id);
      if (existing) {
        if (existing.status === ClassMemberStatus.Active) {
          alreadyInClass.push(code);
          continue;
        }
        await this.classMembersRepository.updateOne(existing.id, {
          status: ClassMemberStatus.Active,
          joined_at: new Date(),
        });
      } else {
        await this.classMembersRepository.createOne({
          class_id: classId,
          user_id: profile.user_id,
          role: ClassMemberRole.Student,
          status: ClassMemberStatus.Active,
          joined_at: new Date(),
        });
      }
      added.push(code);
    }

    return { added: added.length, added_codes: added, already_in_class: alreadyInClass, not_found: notFound };
  }

  // ── Student: request join by join_code ────────────────────────────────────
  async requestJoinClass(studentId: string, dto: RequestJoinClassDto): Promise<ClassMember> {
    const cls = await this.classesRepository.findByJoinCode(dto.join_code.trim().toUpperCase());
    if (!cls) throw new NotFoundException(`Không tìm thấy lớp với mã "${dto.join_code}"`);
    if (!cls.is_active) throw new ConflictException('Lớp học không còn hoạt động');

    const existing = await this.classMembersRepository.findOneByClassAndUser(cls.id, studentId);
    if (existing) {
      if (existing.status === ClassMemberStatus.Active) throw new ConflictException('Bạn đã là thành viên lớp này');
      if (existing.status === ClassMemberStatus.Pending) throw new ConflictException('Yêu cầu của bạn đang chờ duyệt');
      // If rejected, allow re-request
      const updated = await this.classMembersRepository.updateOne(existing.id, {
        status: ClassMemberStatus.Pending,
        joined_at: new Date(),
      }) as unknown as ClassMember;
      this.notificationsService.send(
        cls.teacher_id,
        NotificationType.JOIN_REQUEST,
        'Yêu cầu tham gia lớp học',
        `Có học sinh mới yêu cầu tham gia lớp "${cls.name}"`,
        `/courses/${cls.id}`,
      ).catch(() => undefined);
      return updated;
    }

    const member = await this.classMembersRepository.createOne({
      class_id: cls.id,
      user_id: studentId,
      role: ClassMemberRole.Student,
      status: ClassMemberStatus.Pending,
      joined_at: new Date(),
    });
    this.notificationsService.send(
      cls.teacher_id,
      NotificationType.JOIN_REQUEST,
      'Yêu cầu tham gia lớp học',
      `Có học sinh mới yêu cầu tham gia lớp "${cls.name}"`,
      `/courses/${cls.id}`,
    ).catch(() => undefined);
    return member;
  }

  // ── Teacher: approve pending request ─────────────────────────────────────
  async approveJoinRequest(teacherId: string, classMemberId: string): Promise<ClassMember | null> {
    const member = await this.classMembersRepository.findByIdWithClass(classMemberId);
    if (!member) throw new NotFoundException('Không tìm thấy yêu cầu');
    if (member.role !== ClassMemberRole.Student) throw new ConflictException('Only student requests can be approved');
    if (member.status !== ClassMemberStatus.Pending) throw new ConflictException('Yêu cầu không ở trạng thái chờ duyệt');
    if (!member.class || member.class.teacher_id !== teacherId) throw new ForbiddenException('Bạn không phải giảng viên lớp này');

    const updated = await this.classMembersRepository.updateOne(classMemberId, {
      status: ClassMemberStatus.Active,
      joined_at: new Date(),
    });
    this.notificationsService.send(
      member.user_id,
      NotificationType.JOIN_APPROVED,
      'Yêu cầu tham gia lớp được duyệt',
      `Bạn đã được duyệt vào lớp "${member.class.name}"`,
      `/courses/${member.class_id}`,
    ).catch(() => undefined);
    return updated;
  }

  // ── Teacher: reject pending request ──────────────────────────────────────
  async rejectJoinRequest(teacherId: string, classMemberId: string) {
    const member = await this.classMembersRepository.findByIdWithClass(classMemberId);
    if (!member) throw new NotFoundException('Không tìm thấy yêu cầu');
    if (member.status !== ClassMemberStatus.Pending) throw new ConflictException('Yêu cầu không ở trạng thái chờ duyệt');
    if (!member.class || member.class.teacher_id !== teacherId) throw new ForbiddenException('Bạn không phải giảng viên lớp này');

    const className = member.class.name;
    const userId = member.user_id;
    const classId = member.class_id;
    await this.classMembersRepository.removeOne(classMemberId);
    this.notificationsService.send(
      userId,
      NotificationType.JOIN_REJECTED,
      'Yêu cầu tham gia lớp bị từ chối',
      `Yêu cầu tham gia lớp "${className}" của bạn đã bị từ chối`,
      `/courses/${classId}`,
    ).catch(() => undefined);
    return { rejected: true };
  }

  // ── Teacher: list pending requests ───────────────────────────────────────
  async listPendingRequests(teacherId: string, classId: string) {
    const cls = await this.classesRepository.findById(classId);
    if (!cls || cls.teacher_id !== teacherId) throw new NotFoundException('Class not found');
    return this.classMembersRepository.findPendingRequestsByClassId(classId);
  }

  // ── Misc ──────────────────────────────────────────────────────────────────
  findAll() { return this.classMembersRepository.findAll(); }

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
    if (dto.joined_at !== undefined) payload.joined_at = new Date(dto.joined_at);
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
      .findManyByUserRoleStatus(studentId, ClassMemberRole.Student, ClassMemberStatus.Active)
      .then((members) => members.map((m) => m.class));
  }

  async ensureActiveStudent(classId: string, studentId: string) {
    const member = await this.classMembersRepository.findOneByClassAndUser(classId, studentId);
    if (!member) throw new NotFoundException('Class membership not found');
    if (member.role !== ClassMemberRole.Student) throw new ConflictException('Only students can submit assignments');
    if (member.status !== ClassMemberStatus.Active) throw new ConflictException('Student is not active in this class');
    return member;
  }
}
