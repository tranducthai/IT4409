import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { AssignmentAttachment } from '../modules/assignments/entities/assignment-attachment.entity';
import { Assignment } from '../modules/assignments/entities/assignment.entity';
import { ClassMember } from '../modules/class-members/entities/class-member.entity';
import { ClassMemberRole } from '../modules/class-members/enums/class-member-role.enum';
import { ClassMemberStatus } from '../modules/class-members/enums/class-member-status.enum';
import { Class } from '../modules/classes/entities/class.entity';
import { ClassType } from '../modules/classes/enums/class-type.enum';
import { Discussion } from '../modules/discussions/entities/discussion.entity';
import { LessonContent } from '../modules/lesson-contents/entities/lesson-content.entity';
import { LessonContentType } from '../modules/lesson-contents/enums/lesson-content-type.enum';
import { Lesson } from '../modules/lessons/entities/lesson.entity';
import { Message } from '../modules/messages/entities/message.entity';
import { Question } from '../modules/questions/entities/question.entity';
import { Quiz } from '../modules/quizzes/entities/quiz.entity';
import { Section } from '../modules/sections/entities/section.entity';
import { User } from '../modules/users/entities/user.entity';
import { UserRole } from '../modules/users/enums/user-role.enum';

const PASSWORD = 'Password123!';

type DemoUserSeed = {
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string | null;
};

type DemoClassSeed = {
  join_code: string;
  name: string;
  description: string;
  type: ClassType;
  teacherEmail: string;
  avatar_url: string;
  activeStudentEmails: string[];
  pendingStudentEmails: string[];
};

const userSeeds: DemoUserSeed[] = [
  {
    email: 'demo.admin@7study.local',
    full_name: 'Demo Admin',
    role: UserRole.ADMIN,
    avatar_url: 'https://api.dicebear.com/8.x/initials/svg?seed=Demo%20Admin',
  },
  {
    email: 'demo.teacher.linh@7study.local',
    full_name: 'Nguyen Khanh Linh',
    role: UserRole.TEACHER,
    avatar_url: 'https://api.dicebear.com/8.x/initials/svg?seed=Nguyen%20Khanh%20Linh',
  },
  {
    email: 'demo.teacher.khoa@7study.local',
    full_name: 'Tran Minh Khoa',
    role: UserRole.TEACHER,
    avatar_url: 'https://api.dicebear.com/8.x/initials/svg?seed=Tran%20Minh%20Khoa',
  },
  {
    email: 'demo.student.anh@7study.local',
    full_name: 'Le Mai Anh',
    role: UserRole.STUDENT,
    avatar_url: 'https://api.dicebear.com/8.x/initials/svg?seed=Le%20Mai%20Anh',
  },
  {
    email: 'demo.student.bao@7study.local',
    full_name: 'Pham Gia Bao',
    role: UserRole.STUDENT,
    avatar_url: 'https://api.dicebear.com/8.x/initials/svg?seed=Pham%20Gia%20Bao',
  },
  {
    email: 'demo.student.chi@7study.local',
    full_name: 'Do Minh Chi',
    role: UserRole.STUDENT,
    avatar_url: 'https://api.dicebear.com/8.x/initials/svg?seed=Do%20Minh%20Chi',
  },
  {
    email: 'demo.student.dung@7study.local',
    full_name: 'Hoang Viet Dung',
    role: UserRole.STUDENT,
    avatar_url: 'https://api.dicebear.com/8.x/initials/svg?seed=Hoang%20Viet%20Dung',
  },
  {
    email: 'demo.student.pending@7study.local',
    full_name: 'Bui Thanh Pending',
    role: UserRole.STUDENT,
    avatar_url: 'https://api.dicebear.com/8.x/initials/svg?seed=Bui%20Thanh%20Pending',
  },
];

const classSeeds: DemoClassSeed[] = [
  {
    join_code: 'SEED-REACT',
    name: 'Lap trinh giao dien voi React',
    description:
      'Lop demo ve component, state, routing, API integration va kiem thu giao dien.',
    type: ClassType.Open,
    teacherEmail: 'demo.teacher.linh@7study.local',
    avatar_url:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    activeStudentEmails: [
      'demo.student.anh@7study.local',
      'demo.student.bao@7study.local',
      'demo.student.chi@7study.local',
    ],
    pendingStudentEmails: ['demo.student.pending@7study.local'],
  },
  {
    join_code: 'SEED-DB',
    name: 'Co so du lieu ung dung',
    description:
      'Thuc hanh thiet ke schema, truy van SQL, index, transaction va migration.',
    type: ClassType.Closed,
    teacherEmail: 'demo.teacher.khoa@7study.local',
    avatar_url:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    activeStudentEmails: [
      'demo.student.anh@7study.local',
      'demo.student.dung@7study.local',
    ],
    pendingStudentEmails: ['demo.student.bao@7study.local'],
  },
  {
    join_code: 'SEED-AI',
    name: 'Nhap mon tri tue nhan tao',
    description:
      'Tong quan machine learning, bai toan phan lop, danh gia mo hinh va ung dung AI.',
    type: ClassType.Open,
    teacherEmail: 'demo.teacher.linh@7study.local',
    avatar_url:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    activeStudentEmails: [
      'demo.student.bao@7study.local',
      'demo.student.chi@7study.local',
      'demo.student.dung@7study.local',
    ],
    pendingStudentEmails: [],
  },
];

function addDays(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function upsertUser(repo: Repository<User>, seed: DemoUserSeed) {
  const password = await bcrypt.hash(PASSWORD, 10);
  const existing = await repo.findOne({ where: { email: seed.email } });
  const payload = {
    full_name: seed.full_name,
    email: seed.email,
    password,
    role: seed.role,
    avatar_url: seed.avatar_url ?? null,
  };

  if (existing) {
    await repo.update(existing.id, payload);
    return repo.findOneOrFail({ where: { id: existing.id } });
  }

  return repo.save(repo.create(payload));
}

async function upsertClass(
  repo: Repository<Class>,
  seed: DemoClassSeed,
  teacher: User,
) {
  const existing = await repo.findOne({ where: { join_code: seed.join_code } });
  const payload = {
    name: seed.name,
    description: seed.description,
    avatar_url: seed.avatar_url,
    type: seed.type,
    teacher_id: teacher.id,
    join_code: seed.join_code,
    is_active: true,
  };

  if (existing) {
    await repo.update(existing.id, payload);
    return repo.findOneOrFail({ where: { id: existing.id } });
  }

  return repo.save(repo.create(payload));
}

async function upsertMembership(
  repo: Repository<ClassMember>,
  cls: Class,
  user: User,
  role: ClassMemberRole,
  status: ClassMemberStatus,
) {
  const existing = await repo.findOne({
    where: {
      class_id: cls.id,
      user_id: user.id,
    },
  });
  const payload = {
    class_id: cls.id,
    user_id: user.id,
    role,
    status,
    joined_at: new Date(),
  };

  if (existing) {
    await repo.update(existing.id, payload);
    return repo.findOneOrFail({ where: { id: existing.id } });
  }

  return repo.save(repo.create(payload));
}

async function upsertSection(
  repo: Repository<Section>,
  cls: Class,
  title: string,
  orderIndex: number,
) {
  const existing = await repo.findOne({
    where: {
      class_id: cls.id,
      title,
    },
  });
  const payload = {
    class_id: cls.id,
    title,
    order_index: orderIndex,
  };

  if (existing) {
    await repo.update(existing.id, payload);
    return repo.findOneOrFail({ where: { id: existing.id } });
  }

  return repo.save(repo.create(payload));
}

async function upsertLesson(
  repo: Repository<Lesson>,
  section: Section,
  title: string,
  description: string,
  orderIndex: number,
) {
  const existing = await repo.findOne({
    where: {
      section_id: section.id,
      title,
    },
  });
  const payload = {
    section_id: section.id,
    title,
    description,
    type: LessonContentType.Text,
    file_url: null,
    content: null,
    duration: 45,
    quiz_id: null,
    order_index: orderIndex,
  };

  if (existing) {
    await repo.update(existing.id, payload);
    return repo.findOneOrFail({ where: { id: existing.id } });
  }

  return repo.save(repo.create(payload));
}

async function upsertLessonContent(
  repo: Repository<LessonContent>,
  lesson: Lesson,
  title: string,
  type: LessonContentType,
  orderIndex: number,
  extra: Partial<LessonContent> = {},
) {
  const existing = await repo.findOne({
    where: {
      lesson_id: lesson.id,
      title,
    },
  });
  const payload = {
    lesson_id: lesson.id,
    title,
    type,
    file_url: extra.file_url ?? null,
    content: extra.content ?? null,
    duration: extra.duration ?? null,
    order_index: orderIndex,
  };

  if (existing) {
    await repo.update(existing.id, payload);
    return repo.findOneOrFail({ where: { id: existing.id } });
  }

  return repo.save(repo.create(payload));
}

async function upsertQuiz(
  repo: Repository<Quiz>,
  cls: Class,
  teacher: User,
  title: string,
) {
  const existing = await repo.findOne({
    where: {
      class_id: cls.id,
      title,
    },
  });
  const payload = {
    title,
    description: `Quiz demo cho lop ${cls.name}`,
    time_limit: 20,
    total_questions: 3,
    class_id: cls.id,
    created_by: teacher.id,
    is_random: false,
  };

  if (existing) {
    await repo.update(existing.id, payload);
    return repo.findOneOrFail({ where: { id: existing.id } });
  }

  return repo.save(repo.create(payload));
}

async function upsertQuestion(
  repo: Repository<Question>,
  quiz: Quiz,
  question_text: string,
  correct_answer: string,
) {
  const existing = await repo.findOne({
    where: {
      quiz_id: quiz.id,
      question_text,
    },
  });
  const payload = {
    quiz_id: quiz.id,
    question_text,
    option_a: 'Phuong an A',
    option_b: 'Phuong an B',
    option_c: 'Phuong an C',
    option_d: 'Phuong an D',
    correct_answer,
  };

  if (existing) {
    await repo.update(existing.id, payload);
    return repo.findOneOrFail({ where: { id: existing.id } });
  }

  return repo.save(repo.create(payload));
}

async function upsertAssignment(
  assignmentRepo: Repository<Assignment>,
  attachmentRepo: Repository<AssignmentAttachment>,
  cls: Class,
  teacher: User,
  title: string,
  dueDate: Date | null,
) {
  const existing = await assignmentRepo.findOne({
    where: {
      class_id: cls.id,
      title,
    },
  });
  const payload = {
    class_id: cls.id,
    created_by: teacher.id,
    title,
    description: `Bai tap demo cho lop ${cls.name}. Sinh vien doc yeu cau va nop file theo huong dan.`,
    due_date: dueDate,
  };
  const assignment = existing
    ? await assignmentRepo.save({ ...existing, ...payload })
    : await assignmentRepo.save(assignmentRepo.create(payload));

  const attachmentTitle = `${title}.pdf`;
  const existingAttachment = await attachmentRepo.findOne({
    where: {
      assignment_id: assignment.id,
      original_name: attachmentTitle,
    },
  });
  const attachmentPayload = {
    assignment_id: assignment.id,
    file_url: `https://example.com/demo/${assignment.id}.pdf`,
    original_name: attachmentTitle,
    file_name: `${assignment.id}.pdf`,
    mime_type: 'application/pdf',
    size: 128000,
  };

  if (existingAttachment) {
    await attachmentRepo.update(existingAttachment.id, attachmentPayload);
  } else {
    await attachmentRepo.save(attachmentRepo.create(attachmentPayload));
  }

  return assignment;
}

async function upsertDiscussion(
  discussionRepo: Repository<Discussion>,
  messageRepo: Repository<Message>,
  cls: Class,
  author: User,
  responder: User,
  title: string,
) {
  const existing = await discussionRepo.findOne({
    where: {
      class_id: cls.id,
      title,
    },
  });
  const payload = {
    class_id: cls.id,
    created_by: author.id,
    title,
    content: `Chu de thao luan demo trong lop ${cls.name}.`,
  };
  const discussion = existing
    ? await discussionRepo.save({ ...existing, ...payload })
    : await discussionRepo.save(discussionRepo.create(payload));

  const messages = [
    {
      user_id: author.id,
      content: 'Em can giai thich them ve phan bai tap va tai nguyen lien quan.',
    },
    {
      user_id: responder.id,
      content: 'Giang vien se cap nhat them vi du va link tai lieu trong buoi toi.',
    },
  ];

  for (const message of messages) {
    const existingMessage = await messageRepo.findOne({
      where: {
        discussion_id: discussion.id,
        user_id: message.user_id,
        content: message.content,
      },
    });

    if (!existingMessage) {
      await messageRepo.save(
        messageRepo.create({
          discussion_id: discussion.id,
          ...message,
        }),
      );
    }
  }

  return discussion;
}

async function seedClassContent(
  repos: {
    sectionRepo: Repository<Section>;
    lessonRepo: Repository<Lesson>;
    lessonContentRepo?: Repository<LessonContent>;
    quizRepo: Repository<Quiz>;
    questionRepo: Repository<Question>;
    assignmentRepo: Repository<Assignment>;
    assignmentAttachmentRepo: Repository<AssignmentAttachment>;
    discussionRepo: Repository<Discussion>;
    messageRepo: Repository<Message>;
  },
  cls: Class,
  teacher: User,
  student: User,
) {
  const sectionOne = await upsertSection(
    repos.sectionRepo,
    cls,
    'Week 1 - Tong quan va muc tieu',
    1,
  );
  const sectionTwo = await upsertSection(
    repos.sectionRepo,
    cls,
    'Week 2 - Thuc hanh co ban',
    2,
  );

  const lessonOne = await upsertLesson(
    repos.lessonRepo,
    sectionOne,
    'Gioi thieu hoc phan',
    'Muc tieu, cach danh gia, cong cu va tai nguyen nen chuan bi.',
    1,
  );
  const lessonTwo = await upsertLesson(
    repos.lessonRepo,
    sectionOne,
    'Nen tang can nam',
    'Tong hop kien thuc nen va cac loi thuong gap khi bat dau.',
    2,
  );
  const lessonThree = await upsertLesson(
    repos.lessonRepo,
    sectionTwo,
    'Bai thuc hanh dau tien',
    'Lam quen workflow, nop bai va trao doi tren lop.',
    1,
  );

  if (repos.lessonContentRepo) {
    await upsertLessonContent(
      repos.lessonContentRepo,
      lessonOne,
      'Slide tong quan hoc phan',
      LessonContentType.File,
      1,
      {
        file_url: `https://example.com/demo/${cls.join_code.toLowerCase()}-overview.pdf`,
        duration: 15,
      },
    );
    await upsertLessonContent(
      repos.lessonContentRepo,
      lessonOne,
      'Video gioi thieu lop hoc',
      LessonContentType.Video,
      2,
      {
        file_url: 'https://example.com/demo/intro-video.mp4',
        duration: 900,
      },
    );
    await upsertLessonContent(
      repos.lessonContentRepo,
      lessonTwo,
      'Tom tat kien thuc nen',
      LessonContentType.Text,
      1,
      {
        content:
          'Doc truoc tai lieu, ghi lai cau hoi va hoan thanh bai tap ngan truoc buoi hoc tiep theo.',
      },
    );
  }

  const quiz = await upsertQuiz(
    repos.quizRepo,
    cls,
    teacher,
    `Quiz khoi dong - ${cls.join_code}`,
  );
  await upsertQuestion(
    repos.questionRepo,
    quiz,
    'Muc tieu chinh cua buoi dau tien la gi?',
    'A',
  );
  await upsertQuestion(
    repos.questionRepo,
    quiz,
    'Sinh vien nen lam gi truoc khi vao buoi thuc hanh?',
    'B',
  );
  await upsertQuestion(
    repos.questionRepo,
    quiz,
    'Kenh nao dung de trao doi cau hoi trong lop?',
    'C',
  );
  if (repos.lessonContentRepo) {
    await upsertLessonContent(
      repos.lessonContentRepo,
      lessonThree,
      'Quiz khoi dong gan voi bai hoc',
      LessonContentType.Quiz,
      1,
      {
        file_url: quiz.id,
        content: quiz.id,
        duration: 20,
      },
    );
  }

  await upsertAssignment(
    repos.assignmentRepo,
    repos.assignmentAttachmentRepo,
    cls,
    teacher,
    `Bai tap 1 - ${cls.join_code}`,
    addDays(7),
  );
  await upsertAssignment(
    repos.assignmentRepo,
    repos.assignmentAttachmentRepo,
    cls,
    teacher,
    `Bai tap mo rong - ${cls.join_code}`,
    addDays(14),
  );
  await upsertDiscussion(
    repos.discussionRepo,
    repos.messageRepo,
    cls,
    student,
    teacher,
    `Hoi dap tuan 1 - ${cls.join_code}`,
  );
}

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  try {
    const dataSource = app.get(DataSource);
    const userRepo = dataSource.getRepository(User);
    const classRepo = dataSource.getRepository(Class);
    const classMemberRepo = dataSource.getRepository(ClassMember);
    const sectionRepo = dataSource.getRepository(Section);
    const lessonRepo = dataSource.getRepository(Lesson);
    const queryRunner = dataSource.createQueryRunner();
    const hasLessonContentsTable = await queryRunner.hasTable('lesson_contents');
    await queryRunner.release();
    const lessonContentRepo = hasLessonContentsTable
      ? dataSource.getRepository(LessonContent)
      : undefined;
    const quizRepo = dataSource.getRepository(Quiz);
    const questionRepo = dataSource.getRepository(Question);
    const assignmentRepo = dataSource.getRepository(Assignment);
    const assignmentAttachmentRepo = dataSource.getRepository(AssignmentAttachment);
    const discussionRepo = dataSource.getRepository(Discussion);
    const messageRepo = dataSource.getRepository(Message);

    const usersByEmail = new Map<string, User>();
    for (const seed of userSeeds) {
      const user = await upsertUser(userRepo, seed);
      usersByEmail.set(user.email, user);
    }

    const classes: Class[] = [];
    for (const seed of classSeeds) {
      const teacher = usersByEmail.get(seed.teacherEmail);
      if (!teacher) throw new Error(`Missing teacher ${seed.teacherEmail}`);

      const cls = await upsertClass(classRepo, seed, teacher);
      classes.push(cls);

      await upsertMembership(
        classMemberRepo,
        cls,
        teacher,
        ClassMemberRole.Teacher,
        ClassMemberStatus.Active,
      );

      for (const email of seed.activeStudentEmails) {
        const student = usersByEmail.get(email);
        if (!student) throw new Error(`Missing student ${email}`);
        await upsertMembership(
          classMemberRepo,
          cls,
          student,
          ClassMemberRole.Student,
          ClassMemberStatus.Active,
        );
      }

      for (const email of seed.pendingStudentEmails) {
        const student = usersByEmail.get(email);
        if (!student) throw new Error(`Missing student ${email}`);
        await upsertMembership(
          classMemberRepo,
          cls,
          student,
          ClassMemberRole.Student,
          ClassMemberStatus.Pending,
        );
      }

      const firstStudent = usersByEmail.get(seed.activeStudentEmails[0]);
      if (!firstStudent) throw new Error(`Missing first student for ${cls.name}`);

      await seedClassContent(
        {
          sectionRepo,
          lessonRepo,
          lessonContentRepo,
          quizRepo,
          questionRepo,
          assignmentRepo,
          assignmentAttachmentRepo,
          discussionRepo,
          messageRepo,
        },
        cls,
        teacher,
        firstStudent,
      );
    }

    const counts = {
      users: await userRepo.count({
        where: userSeeds.map((seed) => ({ email: seed.email })),
      }),
      classes: await classRepo.count({
        where: classSeeds.map((seed) => ({ join_code: seed.join_code })),
      }),
      classMembers: await classMemberRepo.count(),
      sections: await sectionRepo.count(),
      lessons: await lessonRepo.count(),
      lessonContents: lessonContentRepo ? await lessonContentRepo.count() : 'skipped_missing_table',
      quizzes: await quizRepo.count(),
      questions: await questionRepo.count(),
      assignments: await assignmentRepo.count(),
      discussions: await discussionRepo.count(),
      messages: await messageRepo.count(),
    };

    console.log(
      JSON.stringify(
        {
          ok: true,
          password: PASSWORD,
          demoAccounts: userSeeds.map((seed) => ({
            email: seed.email,
            role: seed.role,
          })),
          demoClasses: classes.map((cls) => ({
            id: cls.id,
            name: cls.name,
            join_code: cls.join_code,
          })),
          counts,
        },
        null,
        2,
      ),
    );
  } finally {
    await app.close();
  }
}

void main();
