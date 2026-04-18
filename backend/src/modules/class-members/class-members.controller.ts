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
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { UserRole } from '../users/enums/user-role.enum';
import { ClassMembersService } from './class-members.service';
import { CreateClassMemberDto } from './dtos/create-class-member.dto';
import { RequestJoinClassDto } from './dtos/request-join-class.dto';
import { UpdateClassMemberDto } from './dtos/update-class-member.dto';

type AuthedRequest = Request & { user: JwtPayload };

@ApiTags('class-members')
@Controller('class-members')
export class ClassMembersController {
  constructor(private readonly classMembersService: ClassMembersService) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('me/teacher-classes')
  myTeacherClasses(@Req() req: AuthedRequest) {
    if (req.user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('Teacher role required');
    }
    return this.classMembersService.listTeacherClasses(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('me/student-classes')
  myStudentClasses(@Req() req: AuthedRequest) {
    if (req.user.role !== UserRole.STUDENT) {
      throw new ForbiddenException('Student role required');
    }
    return this.classMembersService.listStudentClasses(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('me/request-join')
  requestJoin(@Req() req: AuthedRequest, @Body() dto: RequestJoinClassDto) {
    if (req.user.role !== UserRole.STUDENT) {
      throw new ForbiddenException('Student role required');
    }
    return this.classMembersService.requestJoinClass(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch(':id/approve')
  approve(
    @Req() req: AuthedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    if (req.user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('Teacher role required');
    }
    return this.classMembersService.approveJoinRequest(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('classes/:classId/pending')
  pendingRequests(
    @Req() req: AuthedRequest,
    @Param('classId', new ParseUUIDPipe()) classId: string,
  ) {
    if (req.user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('Teacher role required');
    }
    return this.classMembersService.listPendingRequests(req.user.sub, classId);
  }

  @Post()
  create(@Body() dto: CreateClassMemberDto) {
    return this.classMembersService.create(dto);
  }

  @Get()
  findAll() {
    return this.classMembersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.classMembersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateClassMemberDto,
  ) {
    return this.classMembersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.classMembersService.remove(id);
  }
}
