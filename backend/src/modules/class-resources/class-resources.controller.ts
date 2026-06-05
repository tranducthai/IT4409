import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import type { Request } from 'express';
import { SupabaseStorageService } from '../../common/storage/supabase-storage.service';
import { createMemoryStorage, uploadToSupabaseStorage } from '../../common/utils/upload.util';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { ClassResourcesService } from './class-resources.service';

class CreateFolderBody {
    @IsString()
    name: string;
}

class UploadResourceBody {
    @IsOptional()
    @IsUUID()
    folder_id?: string;
}

type AuthedRequest = Request & { user: JwtPayload };

@ApiTags('class-resources')
@Controller('class-resources')
export class ClassResourcesController {
    constructor(
        private readonly classResourcesService: ClassResourcesService,
        private readonly storageService: SupabaseStorageService,
    ) { }

    // ── Folders ───────────────────────────────────────────────────────────────

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Post('class/:classId/folders')
    createFolder(
        @Req() req: AuthedRequest,
        @Param('classId', ParseUUIDPipe) classId: string,
        @Body() body: CreateFolderBody,
    ) {
        const name = body.name?.trim();
        if (!name) throw new BadRequestException('Tên thư mục không được để trống');
        return this.classResourcesService.createFolder({
            class_id: classId,
            created_by: req.user.sub,
            name,
        });
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Get('class/:classId/folders')
    getFolders(@Param('classId', ParseUUIDPipe) classId: string) {
        return this.classResourcesService.findFoldersByClassId(classId);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Delete('folders/:id')
    deleteFolder(
        @Req() req: AuthedRequest,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.classResourcesService.removeFolder(
            id,
            req.user.sub,
            req.user.role,
        );
    }

    // ── Files ─────────────────────────────────────────────────────────────────

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Post('class/:classId/upload')
    @UseInterceptors(FileInterceptor('file', { storage: createMemoryStorage() }))
    async upload(
        @Req() req: AuthedRequest,
        @Param('classId', ParseUUIDPipe) classId: string,
        @Body() body: UploadResourceBody,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (!file) throw new BadRequestException('File is required');

        const { url, fileName } = await this.storageService.upload(
            'class-resources',
            file,
        );

        return this.classResourcesService.createFile({
            class_id: classId,
            uploaded_by: req.user.sub,
            folder_id: body.folder_id ?? null,
            original_name: file.originalname,
            file_url: url,
            file_name: fileName,
            mime_type: file.mimetype,
            size: file.size,
        });
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Get('class/:classId')
    getFiles(@Param('classId', ParseUUIDPipe) classId: string) {
        return this.classResourcesService.findFilesByClassId(classId);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Delete(':id')
    deleteFile(
        @Req() req: AuthedRequest,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.classResourcesService.removeFile(
            id,
            req.user.sub,
            req.user.role,
        );
    }
}

type AuthedRequest = Request & { user: JwtPayload };

@ApiTags('class-resources')
@Controller('class-resources')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ClassResourcesController {
    constructor(private readonly classResourcesService: ClassResourcesService) { }

    @Get('class/:classId')
    findResources(
        @Req() req: AuthedRequest,
        @Param('classId', ParseUUIDPipe) classId: string,
    ) {
        return this.classResourcesService.findResources(classId, req.user.sub);
    }

    @Post('class/:classId/upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: createMemoryStorage(),
        }),
    )
    async uploadResource(
        @Req() req: AuthedRequest,
        @Param('classId', ParseUUIDPipe) classId: string,
        @Body('folder_id') folderId?: string,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (!file) throw new BadRequestException('File is required');
        const storedFile = await uploadToSupabaseStorage('class-resources', file);
        return this.classResourcesService.uploadResource(
            classId,
            req.user.sub,
            storedFile,
            folderId,
        );
    }

    @Delete(':resourceId')
    deleteResource(
        @Req() req: AuthedRequest,
        @Param('resourceId', ParseUUIDPipe) resourceId: string,
    ) {
        return this.classResourcesService.deleteResource(resourceId, req.user.sub);
    }

    @Get('class/:classId/folders')
    findFolders(
        @Req() req: AuthedRequest,
        @Param('classId', ParseUUIDPipe) classId: string,
    ) {
        return this.classResourcesService.findFolders(classId, req.user.sub);
    }

    @Post('class/:classId/folders')
    createFolder(
        @Req() req: AuthedRequest,
        @Param('classId', ParseUUIDPipe) classId: string,
        @Body('name') name?: string,
    ) {
        return this.classResourcesService.createFolder(
            classId,
            req.user.sub,
            name ?? '',
        );
    }

    @Delete('folders/:folderId')
    deleteFolder(
        @Req() req: AuthedRequest,
        @Param('folderId', ParseUUIDPipe) folderId: string,
    ) {
        return this.classResourcesService.deleteFolder(folderId, req.user.sub);
    }
}
