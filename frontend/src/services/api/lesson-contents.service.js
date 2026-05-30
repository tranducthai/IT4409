import { apiUpload } from './client';

export async function uploadLessonContentFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  return apiUpload('/lesson-contents/upload', formData);
}
