import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { UserRole } from '../users/enums/user-role.enum';
import { ClassMembersService } from './class-members.service';
import { CreateClassMemberDto } from './dtos/create-class-member.dto';
import { RequestJoinClassDto } from './dtos/request-join-class.dto';
import { UpdateClassMemberDto } from './dtos/update-class-member.dto';

class AddByCodeBody {
  @IsString()
  student_code: string;
}

class BulkAddByCodesBody {
  @IsArray()
  @IsString({ each: true })
  student_codes: string[];
}

type AuthedRequest = Request & { user: JwtPayload };

@ApiTags('class-members')
@Controller('class-members')
export class ClassMembersController {
  constructor(private readonly classMembersService: ClassMembersService) { }

  // ── Student: request join by join_code ─────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('me/request-join')
  requestJoin(@Req() req: AuthedRequest, @Body() dto: RequestJoinClassDto) {
    if (req.user.role !== UserRole.STUDENT) throw new ForbiddenException('Student role required');
    return this.classMembersService.requestJoinClass(req.user.sub, dto);
  }

  // ── Teacher: approve pending request ───────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch(':id/approve')
  approve(@Req() req: AuthedRequest, @Param('id', new ParseUUIDPipe()) id: string) {
    if (req.user.role !== UserRole.TEACHER) throw new ForbiddenException('Teacher role required');
    return this.classMembersService.approveJoinRequest(req.user.sub, id);
  }

  // ── Teacher: reject pending request ────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch(':id/reject')
  reject(@Req() req: AuthedRequest, @Param('id', new ParseUUIDPipe()) id: string) {
    if (req.user.role !== UserRole.TEACHER) throw new ForbiddenException('Teacher role required');
    return this.classMembersService.rejectJoinRequest(req.user.sub, id);
  }

  // ── Teacher: view pending requests for a class ─────────────────────────
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('classes/:classId/pending')
  pendingRequests(
    @Req() req: AuthedRequest,
    @Param('classId', new ParseUUIDPipe()) classId: string,
  ) {
    if (req.user.role !== UserRole.TEACHER) throw new ForbiddenException('Teacher role required');
    return this.classMembersService.listPendingRequests(req.user.sub, classId);
  }

  // ── Teacher: add student directly by MSSV ──────────────────────────────
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('classes/:classId/add-by-code')
  addByCode(
    @Req() req: AuthedRequest,
    @Param('classId', new ParseUUIDPipe()) classId: string,
    @Body() body: AddByCodeBody,
  ) {
    if (req.user.role !== UserRole.TEACHER) throw new ForbiddenException('Teacher role required');
    return this.classMembersService.addStudentByCode(req.user.sub, classId, body.student_code);
  }

  // ── Teacher: bulk add students by MSSV list (CSV import) ──────────────
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('classes/:classId/bulk-add')
  bulkAddByCodes(
    @Req() req: AuthedRequest,
    @Param('classId', new ParseUUIDPipe()) classId: string,
    @Body() body: BulkAddByCodesBody,
  ) {
    if (req.user.role !== UserRole.TEACHER) throw new ForbiddenException('Teacher role required');
    return this.classMembersService.bulkAddStudentsByCodes(req.user.sub, classId, body.student_codes);
  }

  // ── Teacher: add student by user UUID (legacy) ─────────────────────────
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post()
  create(@Req() req: AuthedRequest, @Body() dto: CreateClassMemberDto) {
    if (req.user.role !== UserRole.TEACHER) throw new ForbiddenException('Teacher role required');
    return this.classMembersService.create(req.user.sub, dto);
  }

  // ── Teacher/Student dashboard data ─────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('me/teacher-classes')
  myTeacherClasses(@Req() req: AuthedRequest) {
    if (req.user.role !== UserRole.TEACHER) throw new ForbiddenException('Teacher role required');
    return this.classMembersService.listTeacherClasses(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('me/student-classes')
  myStudentClasses(@Req() req: AuthedRequest) {
    if (req.user.role !== UserRole.STUDENT) throw new ForbiddenException('Student role required');
    return this.classMembersService.listStudentClasses(req.user.sub);
  }

  // ── Generic CRUD ───────────────────────────────────────────────────────
  @Get()
  findAll() { return this.classMembersService.findAll(); }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.classMembersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateClassMemberDto) {
    return this.classMembersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.classMembersService.remove(id);
  }
}
