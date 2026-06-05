import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ClassResourceFolder } from './class-resource-folder.entity';
import { ClassResource } from './class-resource.entity';

@Injectable()
export class ClassResourcesRepository {
    constructor(
        @InjectRepository(ClassResource)
        private readonly resourceRepo: Repository<ClassResource>,
        @InjectRepository(ClassResourceFolder)
        private readonly folderRepo: Repository<ClassResourceFolder>,
    ) { }

    // ── Files ────────────────────────────────────────────────────────────────

    findFilesByClassId(class_id: string) {
        return this.resourceRepo.find({
            where: { class_id },
            relations: { uploader: true },
            select: {
                id: true, class_id: true, uploaded_by: true,
                folder_id: true, original_name: true,
                file_url: true, file_name: true, mime_type: true,
                size: true, created_at: true,
                uploader: { id: true, full_name: true, avatar_url: true },
            },
            order: { created_at: 'DESC' },
        });
    }

    findFileById(id: string) {
        return this.resourceRepo.findOne({ where: { id } });
    }

    createFile(data: Partial<ClassResource>) {
        return this.resourceRepo.save(this.resourceRepo.create(data));
    }

    async removeFile(id: string) {
        await this.resourceRepo.delete({ id });
    }

    // ── Folders ──────────────────────────────────────────────────────────────

    findFoldersByClassId(class_id: string) {
        return this.folderRepo.find({
            where: { class_id },
            relations: { creator: true },
            select: {
                id: true, class_id: true, created_by: true,
                name: true, created_at: true,
                creator: { id: true, full_name: true },
            },
            order: { created_at: 'ASC' },
        });
    }

    findFolderById(id: string) {
        return this.folderRepo.findOne({ where: { id } });
    }

    createFolder(data: Partial<ClassResourceFolder>) {
        return this.folderRepo.save(this.folderRepo.create(data));
    }

    async countFilesInFolder(folder_id: string) {
        return this.resourceRepo.count({ where: { folder_id } });
    }

    async removeFolder(id: string) {
        await this.folderRepo.delete({ id });
    }
}
