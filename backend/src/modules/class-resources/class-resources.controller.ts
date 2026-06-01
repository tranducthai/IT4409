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
import type { Request } from 'express';
import { createMemoryStorage, uploadToSupabaseStorage } from '../../common/utils/upload.util';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { ClassResourcesService } from './class-resources.service';

type AuthedRequest = Request & { user: JwtPayload };

@ApiTags('class-resources')
@Controller('class-resources')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ClassResourcesController {
  constructor(private readonly classResourcesService: ClassResourcesService) {}

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
    return this.classResourcesService.createFolder(classId, req.user.sub, name ?? '');
  }

  @Delete('folders/:folderId')
  deleteFolder(
    @Req() req: AuthedRequest,
    @Param('folderId', ParseUUIDPipe) folderId: string,
  ) {
    return this.classResourcesService.deleteFolder(folderId, req.user.sub);
  }
}
