import { memoryStorage } from 'multer';

export function createMemoryStorage() {
    return memoryStorage();
    import { randomUUID } from 'crypto';
    import { mkdirSync } from 'fs';
    import { diskStorage, memoryStorage } from 'multer';
    import { extname, join } from 'path';

    export type StoredFile = {
        file_url: string;
        original_name: string;
        file_name: string;
        mime_type: string;
        size: number;
    };

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

    export function createMemoryStorage() {
        return memoryStorage();
    }

    function sanitizeFileName(value: string) {
        return (value || 'file')
            .normalize('NFKD')
            .replace(/[^\w.\-]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 120) || 'file';
    }

    function encodeObjectPath(path: string) {
        return path.split('/').map(encodeURIComponent).join('/');
    }

    export async function uploadToSupabaseStorage(
        subdir: string,
        file: Express.Multer.File,
    ): Promise<StoredFile> {
        const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
        const serviceKey = process.env.SUPABASE_SERVICE_KEY;
        const bucket = process.env.SUPABASE_BUCKET ?? 'uploads';

        if (!supabaseUrl || !serviceKey) {
            throw new Error('Supabase storage is not configured');
        }
        if (!file.buffer?.length) {
            throw new Error('Uploaded file buffer is empty');
        }

        const safeName = sanitizeFileName(file.originalname);
        const objectPath = `${subdir}/${randomUUID()}-${safeName}`;
        const encodedPath = encodeObjectPath(objectPath);
        const response = await fetch(
            `${supabaseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`,
            {
                method: 'POST',
                headers: {
                    apikey: serviceKey,
                    Authorization: `Bearer ${serviceKey}`,
                    'Content-Type': file.mimetype || 'application/octet-stream',
                    'x-upsert': 'false',
                },
                body: new Uint8Array(file.buffer),
            },
        );

        if (!response.ok) {
            const message = await response.text().catch(() => '');
            throw new Error(message || `Supabase upload failed with status ${response.status}`);
        }

        return {
            file_url: `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`,
            original_name: file.originalname,
            file_name: objectPath,
            mime_type: file.mimetype,
            size: file.size,
        };
    }
