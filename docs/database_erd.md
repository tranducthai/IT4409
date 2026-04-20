# IT4409 Database ERD (Mermaid)

## Dieu huong nhanh

- Tong quan schema chi tiet: [docs/database_schema.md](docs/database_schema.md)
- ERD day du (file hien tai): [docs/database_erd.md](docs/database_erd.md)
- ERD tach nho theo domain: [docs/database_erd_split.md](docs/database_erd_split.md)

Tai lieu nay la ERD tong hop theo migration hien tai.

Nguon:
- backend/src/migrations/1775881197833-InitSchema.ts
- backend/src/migrations/1775881761133-AddClassAvatarUrl.ts

## Full ERD

```mermaid
erDiagram
  USERS {
    uuid id PK
    string full_name
    string email UK
    string password
    users_role_enum role
    string avatar_url
    timestamp created_at
    timestamp updated_at
  }

  STUDENT_PROFILES {
    uuid id PK
    uuid user_id FK, UK
    string student_code UK
    string class_name
    string major
    string course_year
    string phone
    date dob
  }

  TEACHER_PROFILES {
    uuid id PK
    uuid user_id FK, UK
    string specialization
    string degree
    string bio
  }

  CLASSES {
    uuid id PK
    string name
    text description
    classes_type_enum type
    uuid teacher_id FK
    string join_code UK
    boolean is_active
    string avatar_url
    timestamp created_at
  }

  CLASS_MEMBERS {
    uuid id PK
    uuid class_id FK
    uuid user_id FK
    class_members_role_enum role
    class_members_status_enum status
    timestamp joined_at
  }

  WEEKS {
    uuid id PK
    uuid class_id FK
    string title
    int week_number
  }

  CONTENTS {
    uuid id PK
    uuid week_id FK
    string title
    contents_type_enum type
    int order_index
  }

  CONTENT_PAGES {
    uuid id PK
    uuid content_id FK, UK
    text video_url
    text document_url
    uuid quiz_id
  }

  SECTIONS {
    int id PK
    uuid class_id FK
    string title
    int order_index
  }

  LESSONS {
    int id PK
    int section_id FK
    string title
    text description
    int order_index
    timestamp created_at
  }

  LESSON_CONTENTS {
    int id PK
    int lesson_id FK
    lesson_contents_type_enum type
    string title
    string file_url
    text content
    int duration
    int order_index
  }

  VIDEO_SESSIONS {
    uuid id PK
    uuid class_id FK
    uuid host_id FK
    string title
    text description
    string room_url
    timestamp started_at
    timestamp ended_at
    timestamp created_at
  }

  VIDEO_PARTICIPANTS {
    uuid id PK
    uuid video_session_id FK
    uuid user_id FK
    video_participants_role_enum role
    timestamp joined_at
    timestamp left_at
  }

  ASSIGNMENTS {
    uuid id PK
    uuid class_id
    uuid created_by
    string title
    text description
    timestamp due_date
    timestamp created_at
  }

  ASSIGNMENT_SUBMISSIONS {
    uuid id PK
    uuid assignment_id FK
    uuid student_id
    text content
    string file_url
    float score
    text feedback
    timestamp submitted_at
  }

  QUIZZES {
    uuid id PK
    string title
    text description
    int time_limit
    int total_questions
    uuid created_by
    boolean is_random
    timestamp created_at
  }

  QUESTIONS {
    uuid id PK
    uuid quiz_id FK
    text question_text
    text option_a
    text option_b
    text option_c
    text option_d
    string correct_answer
  }

  ANSWERS {
    int id PK
    uuid question_id FK
    text content
    boolean is_correct
  }

  QUIZ_ATTEMPTS {
    uuid id PK
    uuid quiz_id FK
    uuid student_id
    timestamp start_time
    timestamp end_time
    float score
  }

  QUIZ_ANSWERS {
    uuid id PK
    uuid attempt_id FK
    uuid question_id FK
    string selected_answer
    boolean is_correct
  }

  DISCUSSIONS {
    uuid id PK
    uuid class_id
    uuid created_by
    string title
    text content
    timestamp created_at
  }

  MESSAGES {
    uuid id PK
    uuid discussion_id FK
    uuid user_id
    text content
    timestamp created_at
  }

  NOTIFICATIONS {
    uuid id PK
    uuid user_id FK
    notifications_type_enum type
    string title
    text message
    boolean is_read
    timestamp read_at
    timestamp created_at
  }

  USERS ||--|| STUDENT_PROFILES : has
  USERS ||--|| TEACHER_PROFILES : has
  USERS ||--o{ CLASSES : teaches

  CLASSES ||--o{ CLASS_MEMBERS : has
  USERS ||--o{ CLASS_MEMBERS : joins

  CLASSES ||--o{ WEEKS : has
  WEEKS ||--o{ CONTENTS : has
  CONTENTS ||--|| CONTENT_PAGES : has

  CLASSES ||--o{ SECTIONS : has
  SECTIONS ||--o{ LESSONS : has
  LESSONS ||--o{ LESSON_CONTENTS : has

  CLASSES ||--o{ VIDEO_SESSIONS : has
  USERS ||--o{ VIDEO_SESSIONS : hosts
  VIDEO_SESSIONS ||--o{ VIDEO_PARTICIPANTS : includes
  USERS ||--o{ VIDEO_PARTICIPANTS : attends

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

1. So do tren the hien quan he FK hien co trong migration.
2. Mot so cot mang y nghia lien ket nhung chua co FK constraint trong DB:
   - assignments.class_id
   - assignments.created_by
   - assignment_submissions.student_id
   - quizzes.created_by
   - quiz_attempts.student_id
   - discussions.class_id
   - discussions.created_by
   - messages.user_id
   - content_pages.quiz_id
3. Cac cap one-to-one duoc enforce bang UNIQUE tren cot FK:
   - student_profiles.user_id
   - teacher_profiles.user_id
   - content_pages.content_id
4. Cac unique index tong hop quan trong:
   - class_members (class_id, user_id)
   - video_participants (video_session_id, user_id)
