import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { UserRole } from '../users/enums/user-role.enum';
import { ClassResourcesRepository } from './class-resources.repository';

@Injectable()
export class ClassResourcesService {
    constructor(private readonly repo: ClassResourcesRepository) { }

    // ── Files ─────────────────────────────────────────────────────────────────

    createFile(data: {
        class_id: string;
        uploaded_by: string;
        folder_id?: string | null;
        original_name: string;
        file_url: string;
        file_name: string;
        mime_type: string;
        size: number;
    }) {
        return this.repo.createFile(data);
    }

    findFilesByClassId(classId: string) {
        return this.repo.findFilesByClassId(classId);
    }

    async removeFile(id: string, userId: string, role: UserRole) {
        const resource = await this.repo.findFileById(id);
        if (!resource) throw new NotFoundException('Không tìm thấy tài nguyên');
        if (resource.uploaded_by !== userId && role !== UserRole.TEACHER) {
            throw new ForbiddenException('Chỉ người tải lên hoặc giảng viên mới có thể xóa');
        }
        await this.repo.removeFile(id);
        return { deleted: true };
    }

    // ── Folders ───────────────────────────────────────────────────────────────

    createFolder(data: { class_id: string; created_by: string; name: string }) {
        return this.repo.createFolder(data);
    }

    findFoldersByClassId(classId: string) {
        return this.repo.findFoldersByClassId(classId);
    }

    async removeFolder(id: string, userId: string, role: UserRole) {
        const folder = await this.repo.findFolderById(id);
        if (!folder) throw new NotFoundException('Không tìm thấy thư mục');
        if (folder.created_by !== userId && role !== UserRole.TEACHER) {
            throw new ForbiddenException('Chỉ người tạo hoặc giảng viên mới có thể xóa thư mục');
        }
        const count = await this.repo.countFilesInFolder(id);
        if (count > 0) {
            throw new BadRequestException(`Thư mục còn ${count} tài nguyên, hãy xóa hết trước`);
        }
        await this.repo.removeFolder(id);
        return { deleted: true };
    }
}
