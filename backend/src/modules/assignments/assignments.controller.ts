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
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { SupabaseStorageService } from '../../common/storage/supabase-storage.service';
import { createMemoryStorage } from '../../common/utils/upload.util';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { UserRole } from '../users/enums/user-role.enum';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dtos/create-assignment.dto';
import { UpdateAssignmentDto } from './dtos/update-assignment.dto';

type AuthedRequest = Request & { user: JwtPayload };

@ApiTags('assignments')
@Controller('assignments')
export class AssignmentsController {
    constructor(
        private readonly assignmentsService: AssignmentsService,
        private readonly storageService: SupabaseStorageService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Post()
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            storage: createMemoryStorage(),
        }),
    )
    async create(
        @Req() req: AuthedRequest,
        @Body() dto: CreateAssignmentDto,
        @UploadedFiles() files: Express.Multer.File[] = [],
    ) {
        if (req.user.role !== UserRole.TEACHER) {
            throw new ForbiddenException('Teacher role required');
        }
        const attachments = files.map((file) => ({
            file_url: buildFileUrl('assignments', file.filename),
            original_name: file.originalname,
            file_name: file.filename,
            mime_type: file.mimetype,
            size: file.size,
        }));
        return this.assignmentsService.create(req.user.sub, dto, attachments);
    }

    @Get()
    findAll() {
        return this.assignmentsService.findAll();
    }

    @Get('class/:classId')
    findByClass(@Param('classId', ParseUUIDPipe) classId: string) {
        return this.assignmentsService.findByClassId(classId);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.assignmentsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Patch(':id')
    update(
        @Req() req: AuthedRequest,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateAssignmentDto,
    ) {
        if (req.user.role !== UserRole.TEACHER) {
            throw new ForbiddenException('Teacher role required');
        }
        return this.assignmentsService.update(req.user.sub, id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Delete(':id')
    remove(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string) {
        if (req.user.role !== UserRole.TEACHER) {
            throw new ForbiddenException('Teacher role required');
        }
        return this.assignmentsService.remove(req.user.sub, id);
    }
}
