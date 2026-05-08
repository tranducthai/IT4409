import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

export function createDiskStorage(subdir: string) {
    const uploadPath = join(process.cwd(), 'uploads', subdir);
    mkdirSync(uploadPath, { recursive: true });

    return diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadPath),
        filename: (_req, file, cb) => {
            const ext = extname(file.originalname || '');
            cb(null, `${randomUUID()}${ext}`);
        },
    });
}

export function buildFileUrl(subdir: string, filename: string) {
    return `/uploads/${subdir}/${filename}`;
}
