import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassMember } from '../class-members/entities/class-member.entity';
import { ClassMemberStatus } from '../class-members/enums/class-member-status.enum';
import { Class } from '../classes/entities/class.entity';
import { ClassResourceFolder } from './entities/class-resource-folder.entity';
import { ClassResource } from './entities/class-resource.entity';

type UploadedResourceFile = {
  file_url: string;
  original_name: string;
  file_name: string;
  mime_type: string;
  size: number;
};

@Injectable()
export class ClassResourcesService {
  constructor(
    @InjectRepository(ClassResource)
    private readonly resourceRepo: Repository<ClassResource>,
    @InjectRepository(ClassResourceFolder)
    private readonly folderRepo: Repository<ClassResourceFolder>,
    @InjectRepository(Class)
    private readonly classRepo: Repository<Class>,
    @InjectRepository(ClassMember)
    private readonly classMemberRepo: Repository<ClassMember>,
  ) {}

  private async ensureClassAccess(classId: string, userId: string) {
    const cls = await this.classRepo.findOne({ where: { id: classId } });
    if (!cls) throw new NotFoundException('Class not found');
    if (cls.teacher_id === userId) return cls;

    const member = await this.classMemberRepo.findOne({
      where: { class_id: classId, user_id: userId },
    });
    if (!member || member.status !== ClassMemberStatus.Active) {
      throw new ForbiddenException('You are not an active member of this class');
    }
    return cls;
  }

  async findFolders(classId: string, userId: string) {
    await this.ensureClassAccess(classId, userId);
    return this.folderRepo.find({
      where: { class_id: classId },
      relations: { creator: true },
      order: { created_at: 'ASC' },
    });
  }

  async createFolder(classId: string, userId: string, name: string) {
    await this.ensureClassAccess(classId, userId);
    const trimmed = name.trim();
    if (!trimmed) throw new BadRequestException('Folder name is required');

    const folder = await this.folderRepo.save(
      this.folderRepo.create({
        class_id: classId,
        created_by: userId,
        name: trimmed,
      }),
    );
    return this.folderRepo.findOne({
      where: { id: folder.id },
      relations: { creator: true },
    });
  }

  async deleteFolder(folderId: string, userId: string) {
    const folder = await this.folderRepo.findOne({
      where: { id: folderId },
      relations: { class: true },
    });
    if (!folder) throw new NotFoundException('Folder not found');
    const cls = await this.ensureClassAccess(folder.class_id, userId);
    if (folder.created_by !== userId && cls.teacher_id !== userId) {
      throw new ForbiddenException('You cannot delete this folder');
    }

    const fileCount = await this.resourceRepo.count({
      where: { folder_id: folderId },
    });
    if (fileCount > 0) {
      throw new BadRequestException('Folder must be empty before deletion');
    }

    await this.folderRepo.delete({ id: folderId });
    return { deleted: true };
  }

  async findResources(classId: string, userId: string) {
    await this.ensureClassAccess(classId, userId);
    return this.resourceRepo.find({
      where: { class_id: classId },
      relations: { uploader: true, folder: true },
      order: { created_at: 'DESC' },
    });
  }

  async uploadResource(
    classId: string,
    userId: string,
    file: UploadedResourceFile,
    folderId?: string | null,
  ) {
    await this.ensureClassAccess(classId, userId);
    const normalizedFolderId = folderId || null;

    if (normalizedFolderId) {
      const folder = await this.folderRepo.findOne({
        where: { id: normalizedFolderId },
      });
      if (!folder || folder.class_id !== classId) {
        throw new BadRequestException('Folder does not belong to this class');
      }
    }

    const resource = await this.resourceRepo.save(
      this.resourceRepo.create({
        class_id: classId,
        folder_id: normalizedFolderId,
        uploaded_by: userId,
        ...file,
      }),
    );
    return this.resourceRepo.findOne({
      where: { id: resource.id },
      relations: { uploader: true, folder: true },
    });
  }

  async deleteResource(resourceId: string, userId: string) {
    const resource = await this.resourceRepo.findOne({
      where: { id: resourceId },
      relations: { class: true },
    });
    if (!resource) throw new NotFoundException('Resource not found');
    const cls = await this.ensureClassAccess(resource.class_id, userId);
    if (resource.uploaded_by !== userId && cls.teacher_id !== userId) {
      throw new ForbiddenException('You cannot delete this resource');
    }

    await this.resourceRepo.delete({ id: resourceId });
    return { deleted: true };
  }
}
