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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { createDiskStorage, buildFileUrl } from '../../common/utils/upload.util';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateSubmissionDto } from './dtos/create-submission.dto';
import { SubmitAssignmentDto } from './dtos/submit-assignment.dto';
import { UpdateSubmissionDto } from './dtos/update-submission.dto';
import { SubmissionsService } from './submissions.service';

type AuthedRequest = Request & { user: JwtPayload };

@ApiTags('submissions')
@Controller('submissions')
export class SubmissionsController {
    constructor(private readonly submissionsService: SubmissionsService) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Post('assignment/:assignmentId')
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            storage: createDiskStorage('submissions'),
        }),
    )
    submit(
        @Req() req: AuthedRequest,
        @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
        @Body() dto: SubmitAssignmentDto,
        @UploadedFiles() files: Express.Multer.File[] = [],
    ) {
        if (req.user.role !== UserRole.STUDENT) {
            throw new ForbiddenException('Student role required');
        }
        const payload = files.map((file) => ({
            file_url: buildFileUrl('submissions', file.filename),
            original_name: file.originalname,
            file_name: file.filename,
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

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.submissionsService.remove(id);
    }
}
