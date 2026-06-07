import {
    BadRequestException,
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
import { CreateSubmissionDto } from './dtos/create-submission.dto';
import { GradeSubmissionDto } from './dtos/grade-submission.dto';
import { SubmitAssignmentDto } from './dtos/submit-assignment.dto';
import { UpdateSubmissionDto } from './dtos/update-submission.dto';
import { SubmissionsService } from './submissions.service';

type AuthedRequest = Request & { user: JwtPayload };

const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

@ApiTags('submissions')
@Controller('submissions')
export class SubmissionsController {
    constructor(
        private readonly submissionsService: SubmissionsService,
        private readonly storageService: SupabaseStorageService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Post('assignment/:assignmentId')
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            storage: createMemoryStorage(),
            fileFilter: (_req, file, cb) => {
                if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(
                        new BadRequestException(
                            'Chỉ chấp nhận file PDF hoặc Word (.doc, .docx)',
                        ),
                        false,
                    );
                }
            },
        }),
    )
    async submit(
        @Req() req: AuthedRequest,
        @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
        @Body() dto: SubmitAssignmentDto,
        @UploadedFiles() files: Express.Multer.File[] = [],
    ) {
        if (req.user.role !== UserRole.STUDENT) {
            throw new ForbiddenException('Student role required');
        }

        const uploaded = await Promise.all(
            files.map((file) => this.storageService.upload('submissions', file)),
        );

        const payload = files.map((file, i) => ({
            file_url: uploaded[i].url,
            original_name: file.originalname,
            file_name: uploaded[i].fileName,
            mime_type: file.mimetype,
            size: file.size,
        }));

        return this.submissionsService.submit(
            assignmentId,
            req.user.sub,
            dto,
            payload,
        );
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Get('assignment/:assignmentId')
    listByAssignment(
        @Req() req: AuthedRequest,
        @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
    ) {
        if (req.user.role !== UserRole.TEACHER) {
            throw new ForbiddenException('Teacher role required');
        }
        return this.submissionsService.findByAssignmentForTeacher(
            assignmentId,
            req.user.sub,
        );
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Get('assignment/:assignmentId/me')
    listMyByAssignment(
        @Req() req: AuthedRequest,
        @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
    ) {
        if (req.user.role !== UserRole.STUDENT) {
            throw new ForbiddenException('Student role required');
        }
        return this.submissionsService.findMyByAssignment(
            assignmentId,
            req.user.sub,
        );
    }

    @Post()
    create(@Body() dto: CreateSubmissionDto) {
        return this.submissionsService.create(dto);
    }

    @Get()
    findAll() {
        return this.submissionsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.submissionsService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateSubmissionDto,
    ) {
        return this.submissionsService.update(id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Patch(':id/grade')
    grade(
        @Req() req: AuthedRequest,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: GradeSubmissionDto,
    ) {
        if (req.user.role !== UserRole.TEACHER) {
            throw new ForbiddenException('Teacher role required');
        }
        return this.submissionsService.gradeSubmission(
            req.user.sub,
            id,
            dto.score,
            dto.feedback,
        );
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.submissionsService.remove(id);
    }
}
