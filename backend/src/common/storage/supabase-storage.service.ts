import { InternalServerErrorException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class SupabaseStorageService {
    private readonly client: SupabaseClient;
    private readonly bucket: string;

    constructor(private readonly config: ConfigService) {
        const url = config.get<string>('SUPABASE_URL', '');
        const key = config.get<string>('SUPABASE_SERVICE_KEY', '');
        this.bucket = config.get<string>('SUPABASE_BUCKET', 'uploads');
        this.client = createClient(url, key);
    }

    async upload(
        subdir: string,
        file: Express.Multer.File,
    ): Promise<{ url: string; fileName: string }> {
        const ext = extname(file.originalname);
        const fileName = `${subdir}/${randomUUID()}${ext}`;

        const { error } = await this.client.storage
            .from(this.bucket)
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (error) {
            throw new InternalServerErrorException(`Upload thất bại: ${error.message}`);
        }

        const { data } = this.client.storage.from(this.bucket).getPublicUrl(fileName);

        return { url: data.publicUrl, fileName };
    }

    async remove(fileName: string): Promise<void> {
        if (!fileName) return;
        // fileName có thể là path trong bucket (e.g. assignments/uuid.pdf)
        // hoặc full URL — trích path nếu cần
        const path = fileName.includes(`/object/public/${this.bucket}/`)
            ? fileName.split(`/object/public/${this.bucket}/`)[1]
            : fileName;

        await this.client.storage.from(this.bucket).remove([path]);
    }
}
