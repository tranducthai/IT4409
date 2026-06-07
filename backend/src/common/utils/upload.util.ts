import { randomUUID } from 'crypto';
import { memoryStorage } from 'multer';
import { extname } from 'path';

export function createMemoryStorage() {
    return memoryStorage();
}

export type StoredFile = {
    file_url: string;
    original_name: string;
    file_name: string;
    mime_type: string;
    size: number;
};

function sanitizeFileName(value: string) {
    return (value || 'file')
        .normalize('NFKD')
        .replace(/[^\w.\-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 120) || 'file';
}

/** Direct upload via fetch — for use in scripts/seeds that cannot use DI */
export async function uploadToSupabaseStorage(
    subdir: string,
    file: Express.Multer.File,
): Promise<StoredFile> {
    const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;
    const bucket = process.env.SUPABASE_BUCKET ?? 'uploads';

    if (!supabaseUrl || !serviceKey) {
        throw new Error('Supabase storage is not configured (SUPABASE_URL / SUPABASE_SERVICE_KEY missing)');
    }
    if (!file.buffer?.length) {
        throw new Error('Uploaded file buffer is empty');
    }

    const ext = extname(file.originalname);
    const safeName = sanitizeFileName(file.originalname);
    const objectPath = `${subdir}/${randomUUID()}-${safeName}`;

    const response = await fetch(
        `${supabaseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${objectPath.split('/').map(encodeURIComponent).join('/')}`,
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

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${objectPath.split('/').map(encodeURIComponent).join('/')}`;

    return {
        file_url: publicUrl,
        original_name: file.originalname,
        file_name: objectPath,
        mime_type: file.mimetype,
        size: file.size,
    };
}
