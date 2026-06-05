import { memoryStorage } from 'multer';

export function createMemoryStorage() {
    return memoryStorage();
}
