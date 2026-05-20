export const mockClasses = [
  {
    id: '1f6b8a4d-c1d4-4f79-90a9-24d8b4f00001',
    name: 'Xây dựng chương trình dịch',
    description: 'Môn học về quy trình biên dịch',
    avatar_url:
      'https://website-assets.studocu.com/img/document_thumbnails/0e3eb8bc2dde5ea7e2cd7df38b3ac01e/thumb_1200_927.png',
    type: 'PUBLIC',
    teacher_id: '8b2ca5d8-9f69-4c8f-b1ef-183b6a10a222',
    join_code: 'IT3323-ABC',
    is_active: true,
    created_at: '2026-04-20T03:00:00.000Z',
  },
  {
    id: '1f6b8a4d-c1d4-4f79-90a9-24d8b4f00002',
    name: 'Lập trình C cơ bản',
    description: 'Nền tảng ngôn ngữ C cho sinh viên năm đầu',
    avatar_url:
      'https://upload.wikimedia.org/wikipedia/commons/1/18/C_Programming_Language.svg',
    type: 'PUBLIC',
    teacher_id: '8b2ca5d8-9f69-4c8f-b1ef-183b6a10a222',
    join_code: 'IT3230-DEF',
    is_active: true,
    created_at: '2026-04-20T03:10:00.000Z',
  },
  {
    id: '1f6b8a4d-c1d4-4f79-90a9-24d8b4f00003',
    name: 'Nhập môn An toàn thông tin',
    description: 'Căn bản về bảo mật thông tin',
    avatar_url: 'https://via.placeholder.com/400x225',
    type: 'PRIVATE',
    teacher_id: '8b2ca5d8-9f69-4c8f-b1ef-183b6a10a222',
    join_code: 'IT4015E-GHI',
    is_active: true,
    created_at: '2026-04-20T03:20:00.000Z',
  },
];

export const mockClassMembers = [
  {
    id: '7b0d8f93-7cc4-45cb-89c8-a0a0f9660001',
    class_id: '1f6b8a4d-c1d4-4f79-90a9-24d8b4f00001',
    user_id: '2d2f00c3-6f73-4db4-8f6d-8cb2bc44c111',
    role: 'Student',
    status: 'Active',
    joined_at: '2026-04-21T08:00:00.000Z',
  },
  {
    id: '7b0d8f93-7cc4-45cb-89c8-a0a0f9660002',
    class_id: '1f6b8a4d-c1d4-4f79-90a9-24d8b4f00002',
    user_id: '2d2f00c3-6f73-4db4-8f6d-8cb2bc44c111',
    role: 'Student',
    status: 'Active',
    joined_at: '2026-04-21T08:20:00.000Z',
  },
  {
    id: '7b0d8f93-7cc4-45cb-89c8-a0a0f9660003',
    class_id: '1f6b8a4d-c1d4-4f79-90a9-24d8b4f00003',
    user_id: '2d2f00c3-6f73-4db4-8f6d-8cb2bc44c111',
    role: 'Student',
    status: 'Pending',
    joined_at: '2026-04-21T09:00:00.000Z',
  },
];

export const mockSections = [
  {
    id: 1,
    class_id: '1f6b8a4d-c1d4-4f79-90a9-24d8b4f00001',
    title: 'Tuần 1 - Giới thiệu',
    order_index: 1,
  },
  {
    id: 2,
    class_id: '1f6b8a4d-c1d4-4f79-90a9-24d8b4f00001',
    title: 'Tuần 2 - Phân tích từ vựng',
    order_index: 2,
  },
];

export const mockLessons = [
  {
    id: 1,
    section_id: 1,
    title: 'Tổng quan chương trình dịch',
    description: 'Tổng quan về các pha trong compiler',
    order_index: 1,
    created_at: '2026-04-21T09:00:00.000Z',
  },
  {
    id: 2,
    section_id: 2,
    title: 'Token từ vựng và Regex',
    description: 'Nhận diện token và quy tắc lexical',
    order_index: 1,
    created_at: '2026-04-21T09:30:00.000Z',
  },
];

export const mockLessonContents = [
  {
    id: 1,
    lesson_id: 1,
    type: 'video',
    title: 'Video bài giảng 1',
    file_url: 'https://example.com/video-1',
    content: null,
    duration: 900,
    order_index: 1,
  },
  {
    id: 2,
    lesson_id: 1,
    type: 'text',
    title: 'Tóm tắt bài học',
    file_url: null,
    content: 'Nội dung tóm tắt...',
    duration: null,
    order_index: 2,
  },
  {
    id: 3,
    lesson_id: 2,
    type: 'file',
    title: 'PDF slide lexical analysis',
    file_url: 'https://example.com/slides-lexical.pdf',
    content: null,
    duration: null,
    order_index: 1,
  },
  {
    id: 4,
    lesson_id: 2,
    type: 'quiz',
    title: 'Quiz lexical analysis',
    file_url: null,
    content: '9c4f1d8d-66a4-4bb2-b312-2b9d60000001',
    duration: 15,
    order_index: 2,
  },
];

export const mockQuizzes = [
  {
    id: '9c4f1d8d-66a4-4bb2-b312-2b9d60000001',
    title: 'Quiz lexical analysis',
    description: 'Kiểm tra nhanh về token, regex và scanner',
    time_limit: 15,
    total_questions: 10,
    class_id: '1f6b8a4d-c1d4-4f79-90a9-24d8b4f00001',
    created_by: '8b2ca5d8-9f69-4c8f-b1ef-183b6a10a222',
    is_random: false,
    created_at: '2026-04-22T09:00:00.000Z',
  },
];
