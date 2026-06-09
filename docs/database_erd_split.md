# IT4409 Database ERD (Split by Domain)

## Dieu huong nhanh

- Tong quan schema chi tiet: [docs/database_schema.md](docs/database_schema.md)
- ERD day du (1 so do lon): [docs/database_erd.md](docs/database_erd.md)
- ERD tach nho theo domain (file hien tai): [docs/database_erd_split.md](docs/database_erd_split.md)

File nay tach ERD thanh nhieu khoi nho de Markdown Preview render on dinh hon.

Nguon schema:
- backend/src/migrations/1775881197833-InitSchema.ts
- backend/src/migrations/1775881761133-AddClassAvatarUrl.ts

## 1) Identity + Class Membership

```mermaid
erDiagram
  USERS {
    uuid id PK
    string email UK
    users_role_enum role
  }

  STUDENT_PROFILES {
    uuid id PK
    uuid user_id FK, UK
    string student_code UK
  }

  TEACHER_PROFILES {
    uuid id PK
    uuid user_id FK, UK
  }

  CLASSES {
    uuid id PK
    uuid teacher_id FK
    string join_code UK
  }

  CLASS_MEMBERS {
    uuid id PK
    uuid class_id FK
    uuid user_id FK
    class_members_role_enum role
    class_members_status_enum status
  }

  USERS ||--|| STUDENT_PROFILES : has
  USERS ||--|| TEACHER_PROFILES : has
  USERS ||--o{ CLASSES : teaches
  CLASSES ||--o{ CLASS_MEMBERS : has
  USERS ||--o{ CLASS_MEMBERS : joins
```

## 2) Learning Content Hierarchy

```mermaid
erDiagram
  CLASSES {
    uuid id PK
  }

  WEEKS {
    uuid id PK
    uuid class_id FK
    int week_number
  }

  CONTENTS {
    uuid id PK
    uuid week_id FK
    contents_type_enum type
    int order_index
  }

  CONTENT_PAGES {
    uuid id PK
    uuid content_id FK, UK
    uuid quiz_id
  }

  SECTIONS {
    int id PK
    uuid class_id FK
    int order_index
  }

  LESSONS {
    int id PK
    int section_id FK
    int order_index
  }

  LESSON_CONTENTS {
    int id PK
    int lesson_id FK
    lesson_contents_type_enum type
    int order_index
  }

  CLASSES ||--o{ WEEKS : has
  WEEKS ||--o{ CONTENTS : has
  CONTENTS ||--|| CONTENT_PAGES : has

  CLASSES ||--o{ SECTIONS : has
  SECTIONS ||--o{ LESSONS : has
  LESSONS ||--o{ LESSON_CONTENTS : has
```

## 3) Live Video Session

```mermaid
erDiagram
  USERS {
    uuid id PK
  }

  CLASSES {
    uuid id PK
  }

  VIDEO_SESSIONS {
    uuid id PK
    uuid class_id FK
    uuid host_id FK
  }

  VIDEO_PARTICIPANTS {
    uuid id PK
    uuid video_session_id FK
    uuid user_id FK
    video_participants_role_enum role
  }

  CLASSES ||--o{ VIDEO_SESSIONS : has
  USERS ||--o{ VIDEO_SESSIONS : hosts
  VIDEO_SESSIONS ||--o{ VIDEO_PARTICIPANTS : includes
  USERS ||--o{ VIDEO_PARTICIPANTS : attends
```

## 4) Assignment + Quiz + Discussion + Notification

```mermaid
erDiagram
  ASSIGNMENTS {
    uuid id PK
    uuid class_id
    uuid created_by
  }

  ASSIGNMENT_SUBMISSIONS {
    uuid id PK
    uuid assignment_id FK
    uuid student_id
  }

  QUIZZES {
    uuid id PK
    uuid created_by
  }

  QUESTIONS {
    uuid id PK
    uuid quiz_id FK
  }

  ANSWERS {
    int id PK
    uuid question_id FK
  }

  QUIZ_ATTEMPTS {
    uuid id PK
    uuid quiz_id FK
    uuid student_id
  }

  QUIZ_ANSWERS {
    uuid id PK
    uuid attempt_id FK
    uuid question_id FK
  }

  DISCUSSIONS {
    uuid id PK
    uuid class_id
    uuid created_by
  }

  MESSAGES {
    uuid id PK
    uuid discussion_id FK
    uuid user_id
  }

  USERS {
    uuid id PK
  }

  NOTIFICATIONS {
    uuid id PK
    uuid user_id FK
    notifications_type_enum type
  }

  ASSIGNMENTS ||--o{ ASSIGNMENT_SUBMISSIONS : has

  QUIZZES ||--o{ QUESTIONS : has
  QUESTIONS ||--o{ ANSWERS : has
  QUIZZES ||--o{ QUIZ_ATTEMPTS : has
  QUIZ_ATTEMPTS ||--o{ QUIZ_ANSWERS : has
  QUESTIONS ||--o{ QUIZ_ANSWERS : graded_by

  DISCUSSIONS ||--o{ MESSAGES : has
  USERS ||--o{ NOTIFICATIONS : receives
```

## Notes

1. File nay uu tien kha nang render trong VS Code hon la hien thi day du moi cot.
2. So do full van o docs/database_erd.md.
3. Nhung cot co y nghia lien ket nhung chua co FK constraint van duoc ghi chu trong docs/database_schema.md.
