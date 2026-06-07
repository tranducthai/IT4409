import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { existsSync, readFileSync } from 'fs';
import { basename, extname, join } from 'path';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { uploadToSupabaseStorage, StoredFile } from '../common/utils/upload.util';
import { AssignmentAttachment } from '../modules/assignments/entities/assignment-attachment.entity';
import { Assignment } from '../modules/assignments/entities/assignment.entity';
import { ClassMember } from '../modules/class-members/entities/class-member.entity';
import { ClassMemberRole } from '../modules/class-members/enums/class-member-role.enum';
import { ClassMemberStatus } from '../modules/class-members/enums/class-member-status.enum';
import { ClassResourceFolder } from '../modules/class-resources/class-resource-folder.entity';
import { ClassResource } from '../modules/class-resources/class-resource.entity';
import { Class } from '../modules/classes/entities/class.entity';
import { ClassType } from '../modules/classes/enums/class-type.enum';
import { Discussion } from '../modules/discussions/entities/discussion.entity';
import { LessonContentType } from '../modules/lesson-contents/enums/lesson-content-type.enum';
import { Lesson } from '../modules/lessons/entities/lesson.entity';
import { Message } from '../modules/messages/entities/message.entity';
import { Question } from '../modules/questions/entities/question.entity';
import { QuizAnswer } from '../modules/quiz-answers/entities/quiz-answer.entity';
import { QuizAttempt } from '../modules/quiz-attempts/entities/quiz-attempt.entity';
import { Quiz } from '../modules/quizzes/entities/quiz.entity';
import { Section } from '../modules/sections/entities/section.entity';
import { SubmissionFile } from '../modules/submissions/entities/submission-file.entity';
import { Submission } from '../modules/submissions/entities/submission.entity';
import { User } from '../modules/users/entities/user.entity';
import { UserRole } from '../modules/users/enums/user-role.enum';

const yaml = require('js-yaml') as { load(input: string): any };

const ROOT_DIR = join(__dirname, '../../..');
const YAML_PATH = join(ROOT_DIR, 'cs50w_seed_course.yaml');
const RESOURCE_DIR = process.env.CS50W_RESOURCE_DIR ?? '/tmp/cs50w_resources';

type SeedContext = {
  dataSource: DataSource;
  users: Repository<User>;
  classes: Repository<Class>;
  classMembers: Repository<ClassMember>;
  sections: Repository<Section>;
  lessons: Repository<Lesson>;
  quizzes: Repository<Quiz>;
  questions: Repository<Question>;
  quizAttempts: Repository<QuizAttempt>;
  quizAnswers: Repository<QuizAnswer>;
  discussions: Repository<Discussion>;
  messages: Repository<Message>;
  assignments: Repository<Assignment>;
  assignmentAttachments: Repository<AssignmentAttachment>;
  submissions: Repository<Submission>;
  submissionFiles: Repository<SubmissionFile>;
  resourceFolders: Repository<ClassResourceFolder>;
  resources: Repository<ClassResource>;
};

const quizLessonIndexes = [0, 2, 4, 6, 8];

function normalizeRole(value: string): UserRole {
  const role = String(value ?? '').toUpperCase();
  if (role === UserRole.ADMIN || role === UserRole.TEACHER || role === UserRole.STUDENT) {
    return role as UserRole;
  }
  return UserRole.STUDENT;
}

function normalizeClassType(value: string): ClassType {
  return String(value ?? '').toUpperCase() === ClassType.Closed ? ClassType.Closed : ClassType.Open;
}

function letterFromIndex(index: number): 'A' | 'B' | 'C' | 'D' {
  return (['A', 'B', 'C', 'D'][index] ?? 'A') as 'A' | 'B' | 'C' | 'D';
}

function contentType(value: string): LessonContentType {
  const normalized = String(value ?? '').toLowerCase();
  if (normalized === LessonContentType.Video) return LessonContentType.Video;
  if (normalized === LessonContentType.File) return LessonContentType.File;
  if (normalized === LessonContentType.Quiz) return LessonContentType.Quiz;
  return LessonContentType.Text;
}

function mimeTypeFor(fileName: string) {
  const ext = extname(fileName).toLowerCase();
  if (ext === '.pdf') return 'application/pdf';
  if (ext === '.zip') return 'application/zip';
  return 'application/octet-stream';
}

function localFileForUrl(url: string) {
  if (!url?.startsWith('https://cdn.cs50.net/')) return null;

  const parsed = new URL(url);
  const parts = parsed.pathname.split('/').filter(Boolean);
  const lecture = parts.includes('lectures') ? parts[parts.indexOf('lectures') + 1] : 'misc';
  const fileName = `lecture${lecture}-${basename(parsed.pathname)}`;
  const localPath = join(RESOURCE_DIR, fileName);

  return existsSync(localPath) ? localPath : null;
}

function asMulterFile(filePath: string): Express.Multer.File {
  const originalname = basename(filePath);
  const buffer = readFileSync(filePath);
  return {
    fieldname: 'file',
    originalname,
    encoding: '7bit',
    mimetype: mimeTypeFor(originalname),
    size: buffer.length,
    buffer,
  } as Express.Multer.File;
}

async function upsertUser(repo: Repository<User>, seed: any, role: UserRole) {
  const existing = await repo.findOne({ where: { email: seed.email } });
  const payload = {
    full_name: seed.full_name,
    email: seed.email,
    password: await bcrypt.hash(seed.password ?? 'Password123!', 10),
    role,
    avatar_url: seed.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(seed.full_name)}`,
  };

  if (existing) {
    await repo.update(existing.id, payload);
    return repo.findOneOrFail({ where: { id: existing.id } });
  }

  return repo.save(repo.create(payload));
}

async function upsertClass(ctx: SeedContext, seed: any, teacher: User) {
  const existing = await ctx.classes.findOne({ where: { join_code: seed.join_code } });
  const payload = {
    name: seed.name,
    description: seed.description,
    avatar_url: seed.avatar_url ?? null,
    type: normalizeClassType(seed.type),
    teacher_id: teacher.id,
    join_code: seed.join_code,
    is_active: true,
  };

  if (existing) {
    await ctx.classes.update(existing.id, payload);
    return ctx.classes.findOneOrFail({ where: { id: existing.id } });
  }

  return ctx.classes.save(ctx.classes.create(payload));
}

async function upsertMembership(
  repo: Repository<ClassMember>,
  cls: Class,
  user: User,
  role: ClassMemberRole,
  status = ClassMemberStatus.Active,
) {
  const existing = await repo.findOne({ where: { class_id: cls.id, user_id: user.id } });
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

async function upsertSection(repo: Repository<Section>, cls: Class, seed: any) {
  const existing = await repo.findOne({ where: { class_id: cls.id, title: seed.title } });
  const payload = {
    class_id: cls.id,
    title: seed.title,
    order_index: seed.order_index,
  };

  if (existing) {
    await repo.update(existing.id, payload);
    return repo.findOneOrFail({ where: { id: existing.id } });
  }

  return repo.save(repo.create(payload));
}

async function upsertLesson(repo: Repository<Lesson>, section: Section, seed: any) {
  const existing = await repo.findOne({ where: { section_id: section.id, title: seed.title } });
  const payload = {
    section_id: section.id,
    title: seed.title,
    description: seed.description,
    type: seed.type ?? LessonContentType.Text,
    file_url: seed.file_url ?? null,
    content: seed.content ?? null,
    duration: seed.duration ?? null,
    quiz_id: seed.quiz_id ?? null,
    order_index: seed.order_index,
  };

  if (existing) {
    await repo.update(existing.id, payload);
    return repo.findOneOrFail({ where: { id: existing.id } });
  }

  return repo.save(repo.create(payload));
}

async function upsertQuizLesson(
  repo: Repository<Lesson>,
  lesson: Lesson,
  quiz: Quiz,
) {
  const title = `Quiz - ${lesson.title}`;
  const existing = await repo.findOne({ where: { section_id: lesson.section_id, title } });
  const payload = {
    section_id: lesson.section_id,
    title,
    description: quiz.description ?? `Quiz nhanh cho bÃ i ${lesson.title}`,
    type: LessonContentType.Quiz,
    file_url: quiz.id,
    content: quiz.id,
    duration: quiz.time_limit,
    quiz_id: quiz.id,
    order_index: lesson.order_index + 50,
  };

  if (existing) {
    await repo.update(existing.id, payload);
    return repo.findOneOrFail({ where: { id: existing.id } });
  }

  return repo.save(repo.create(payload));
}

async function upsertFolder(
  repo: Repository<ClassResourceFolder>,
  cls: Class,
  teacher: User,
  name: string,
) {
  const existing = await repo.findOne({ where: { class_id: cls.id, name } });
  const payload = {
    class_id: cls.id,
    created_by: teacher.id,
    name,
  };

  if (existing) {
    await repo.update(existing.id, payload);
    return repo.findOneOrFail({ where: { id: existing.id } });
  }

  return repo.save(repo.create(payload));
}

async function upsertResource(
  repo: Repository<ClassResource>,
  cls: Class,
  teacher: User,
  folder: ClassResourceFolder | null,
  stored: StoredFile,
) {
  const existing = await repo.findOne({
    where: {
      class_id: cls.id,
      original_name: stored.original_name,
    },
  });
  const payload = {
    class_id: cls.id,
    folder_id: folder?.id ?? null,
    uploaded_by: teacher.id,
    file_url: stored.file_url,
    original_name: stored.original_name,
    file_name: stored.file_name,
    mime_type: stored.mime_type,
    size: stored.size,
  };

  if (existing) {
    await repo.update(existing.id, payload);
    return repo.findOneOrFail({ where: { id: existing.id } });
  }

  return repo.save(repo.create(payload));
}

function linkResource(title: string, url: string): StoredFile {
  return {
    file_url: url,
    original_name: `${title}.url`,
    file_name: `${title}.url`,
    mime_type: 'text/uri-list',
    size: Buffer.byteLength(url),
  };
}

async function resolveStoredFile(
  ctx: SeedContext,
  cls: Class,
  url: string,
  uploadCache: Map<string, StoredFile>,
) {
  if (!url) return null;

  if (uploadCache.has(url)) return uploadCache.get(url)!;

  const localPath = localFileForUrl(url);
  if (!localPath) return null;

  const originalName = basename(localPath);
  const existing = await ctx.resources.findOne({
    where: {
      class_id: cls.id,
      original_name: originalName,
    },
  });

  if (existing) {
    const stored = {
      file_url: existing.file_url,
      original_name: existing.original_name,
      file_name: existing.file_name,
      mime_type: existing.mime_type,
      size: existing.size,
    };
    uploadCache.set(url, stored);
    return stored;
  }

  const stored = await uploadToSupabaseStorage('cs50w-resources', asMulterFile(localPath));
  uploadCache.set(url, stored);
  return stored;
}

async function upsertQuizWithQuestion(
  ctx: SeedContext,
  cls: Class,
  teacher: User,
  lesson: Lesson,
  baseTitle: string,
  questionSeed: any,
) {
  const title = `${baseTitle} - ${lesson.title}`;
  const existing = await ctx.quizzes.findOne({ where: { class_id: cls.id, title } });
  const payload = {
    title,
    description: questionSeed.explanation ?? `Quiz nhanh cho bÃ i ${lesson.title}`,
    time_limit: 5,
    total_questions: 1,
    class_id: cls.id,
    created_by: teacher.id,
    is_random: false,
  };
  const quiz = existing
    ? await ctx.quizzes.save({ ...existing, ...payload })
    : await ctx.quizzes.save(ctx.quizzes.create(payload));

  const options = questionSeed.options ?? [];
  const correct = letterFromIndex(Number(questionSeed.correct_option_index ?? 0));
  const questionPayload = {
    quiz_id: quiz.id,
    question_text: questionSeed.question_text,
    option_a: options[0] ?? '',
    option_b: options[1] ?? '',
    option_c: options[2] ?? '',
    option_d: options[3] ?? '',
    correct_answer: correct,
  };
  const existingQuestion = await ctx.questions.findOne({
    where: { quiz_id: quiz.id, question_text: questionSeed.question_text },
  });
  const question = existingQuestion
    ? await ctx.questions.save({ ...existingQuestion, ...questionPayload })
    : await ctx.questions.save(ctx.questions.create(questionPayload));

  await upsertQuizLesson(ctx.lessons, lesson, quiz);

  return { quiz, question, selected: correct };
}

async function upsertQuizAttempt(
  ctx: SeedContext,
  quiz: Quiz,
  question: Question,
  student: User,
  selected: string,
) {
  const existing = await ctx.quizAttempts.findOne({
    where: { quiz_id: quiz.id, student_id: student.id },
  });
  const payload = {
    quiz_id: quiz.id,
    student_id: student.id,
    end_time: new Date(),
    score: 100,
  };
  const attempt = existing
    ? await ctx.quizAttempts.save({ ...existing, ...payload })
    : await ctx.quizAttempts.save(ctx.quizAttempts.create(payload));

  const answerExisting = await ctx.quizAnswers.findOne({
    where: { attempt_id: attempt.id, question_id: question.id },
  });
  const answerPayload = {
    attempt_id: attempt.id,
    question_id: question.id,
    selected_answer: selected,
    is_correct: true,
  };
  if (answerExisting) {
    await ctx.quizAnswers.update(answerExisting.id, answerPayload);
  } else {
    await ctx.quizAnswers.save(ctx.quizAnswers.create(answerPayload));
  }
}

function authorForMessage(authorByKey: Map<string, User>, author: string) {
  return authorByKey.get(String(author ?? '').toLowerCase()) ?? authorByKey.get('teacher')!;
}

async function upsertDiscussion(
  ctx: SeedContext,
  cls: Class,
  teacher: User,
  authorByKey: Map<string, User>,
  seed: any,
) {
  const existing = await ctx.discussions.findOne({ where: { class_id: cls.id, title: seed.title } });
  const discussionPayload = {
    class_id: cls.id,
    created_by: teacher.id,
    title: seed.title,
    content: 'Tháº£o luáº­n demo Ä‘Æ°á»£c seed tá»« khÃ³a CS50W.',
  };
  const discussion = existing
    ? await ctx.discussions.save({ ...existing, ...discussionPayload })
    : await ctx.discussions.save(ctx.discussions.create(discussionPayload));

  for (const message of seed.messages ?? []) {
    const author = authorForMessage(authorByKey, message.author);
    const existingMessage = await ctx.messages.findOne({
      where: {
        discussion_id: discussion.id,
        user_id: author.id,
        content: message.content,
      },
    });
    if (!existingMessage) {
      await ctx.messages.save(
        ctx.messages.create({
          discussion_id: discussion.id,
          user_id: author.id,
          content: message.content,
        }),
      );
    }
  }

  return discussion;
}

async function upsertAssignment(
  ctx: SeedContext,
  cls: Class,
  teacher: User,
  student: User,
  seed: any,
) {
  const existing = await ctx.assignments.findOne({ where: { class_id: cls.id, title: seed.title } });
  const payload = {
    class_id: cls.id,
    created_by: teacher.id,
    title: seed.title,
    description: seed.description,
    due_date: seed.due_date ? new Date(seed.due_date) : null,
  };
  const assignment = existing
    ? await ctx.assignments.save({ ...existing, ...payload })
    : await ctx.assignments.save(ctx.assignments.create(payload));

  for (const attachment of seed.attachments ?? []) {
    const url = attachment.file_path_or_url;
    const originalName = `${seed.title}.url`;
    const existingAttachment = await ctx.assignmentAttachments.findOne({
      where: { assignment_id: assignment.id, original_name: originalName },
    });
    const attachmentPayload = {
      assignment_id: assignment.id,
      file_url: url,
      original_name: originalName,
      file_name: originalName,
      mime_type: 'text/uri-list',
      size: Buffer.byteLength(url),
    };
    if (existingAttachment) {
      await ctx.assignmentAttachments.update(existingAttachment.id, attachmentPayload);
    } else {
      await ctx.assignmentAttachments.save(ctx.assignmentAttachments.create(attachmentPayload));
    }
  }

  const submissionExisting = await ctx.submissions.findOne({
    where: { assignment_id: assignment.id, student_id: student.id },
  });
  const submissionPayload = {
    assignment_id: assignment.id,
    student_id: student.id,
    content: seed.sample_submission?.content ?? 'BÃ i ná»™p máº«u cho demo.',
    file_url: null,
    score: 9,
    feedback: 'BÃ i lÃ m Ä‘Ã¡p á»©ng yÃªu cáº§u demo, cáº¥u trÃºc rÃµ rÃ ng.',
  };
  const submission = submissionExisting
    ? await ctx.submissions.save({ ...submissionExisting, ...submissionPayload })
    : await ctx.submissions.save(ctx.submissions.create(submissionPayload));

  const fileName = 'cs50w-demo-submission.txt';
  const fileExisting = await ctx.submissionFiles.findOne({
    where: { submission_id: submission.id, original_name: fileName },
  });
  const filePayload = {
    submission_id: submission.id,
    file_url: seed.attachments?.[0]?.file_path_or_url ?? 'https://cs50.harvard.edu/web/projects/0/',
    original_name: fileName,
    file_name: fileName,
    mime_type: 'text/plain',
    size: Buffer.byteLength(submissionPayload.content ?? ''),
  };
  if (fileExisting) {
    await ctx.submissionFiles.update(fileExisting.id, filePayload);
  } else {
    await ctx.submissionFiles.save(ctx.submissionFiles.create(filePayload));
  }

  return assignment;
}

async function main() {
  if (!existsSync(YAML_PATH)) {
    throw new Error(`Missing seed file: ${YAML_PATH}`);
  }

  const seed = yaml.load(readFileSync(YAML_PATH, 'utf8'));
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  try {
    const dataSource = app.get(DataSource);
    const ctx: SeedContext = {
      dataSource,
      users: dataSource.getRepository(User),
      classes: dataSource.getRepository(Class),
      classMembers: dataSource.getRepository(ClassMember),
      sections: dataSource.getRepository(Section),
      lessons: dataSource.getRepository(Lesson),
      quizzes: dataSource.getRepository(Quiz),
      questions: dataSource.getRepository(Question),
      quizAttempts: dataSource.getRepository(QuizAttempt),
      quizAnswers: dataSource.getRepository(QuizAnswer),
      discussions: dataSource.getRepository(Discussion),
      messages: dataSource.getRepository(Message),
      assignments: dataSource.getRepository(Assignment),
      assignmentAttachments: dataSource.getRepository(AssignmentAttachment),
      submissions: dataSource.getRepository(Submission),
      submissionFiles: dataSource.getRepository(SubmissionFile),
      resourceFolders: dataSource.getRepository(ClassResourceFolder),
      resources: dataSource.getRepository(ClassResource),
    };

    const teacher = await upsertUser(ctx.users, seed.teacher, UserRole.TEACHER);
    const studentSeeds = [seed.student, ...(seed.students ?? [])].filter(Boolean);
    const students: User[] = [];
    for (const [index, studentSeed] of studentSeeds.entries()) {
      students.push(await upsertUser(ctx.users, studentSeed, normalizeRole(studentSeed.role)));
      studentSeeds[index].key = studentSeed.key ?? (index === 0 ? 'student' : `student_${index + 1}`);
    }
    const pendingStudents: User[] = [];
    for (const pendingSeed of seed.pending_students ?? []) {
      pendingStudents.push(await upsertUser(ctx.users, pendingSeed, UserRole.STUDENT));
    }
    const rejectedStudents: User[] = [];
    for (const rejectedSeed of seed.rejected_students ?? []) {
      rejectedStudents.push(await upsertUser(ctx.users, rejectedSeed, UserRole.STUDENT));
    }
    const student = students[0];
    const cls = await upsertClass(ctx, seed.course, teacher);

    await upsertMembership(ctx.classMembers, cls, teacher, ClassMemberRole.Teacher);
    for (const enrolledStudent of students) {
      await upsertMembership(ctx.classMembers, cls, enrolledStudent, ClassMemberRole.Student);
    }
    for (const pendingStudent of pendingStudents) {
      await upsertMembership(
        ctx.classMembers,
        cls,
        pendingStudent,
        ClassMemberRole.Student,
        ClassMemberStatus.Pending,
      );
    }
    for (const rejectedStudent of rejectedStudents) {
      await upsertMembership(
        ctx.classMembers,
        cls,
        rejectedStudent,
        ClassMemberRole.Student,
        ClassMemberStatus.Rejected,
      );
    }

    const uploadCache = new Map<string, StoredFile>();
    const downloadedFolder = await upsertFolder(ctx.resourceFolders, cls, teacher, 'TÃ i nguyÃªn táº£i vá» tá»« CS50W');

    const allLessons: Lesson[] = [];
    for (const sectionSeed of seed.sections ?? []) {
      const section = await upsertSection(ctx.sections, cls, sectionSeed);
      for (const lessonSeed of sectionSeed.lessons ?? []) {
        for (const [contentIndex, contentSeed] of (lessonSeed.contents ?? []).entries()) {
          const sourceUrl = contentSeed.file_url ?? contentSeed.file_path_or_url ?? null;
          const stored = sourceUrl ? await resolveStoredFile(ctx, cls, sourceUrl, uploadCache) : null;

          if (stored) {
            await upsertResource(ctx.resources, cls, teacher, downloadedFolder, stored);
          }

          const title =
            contentIndex === 0
              ? lessonSeed.title
              : `${lessonSeed.title}: ${contentSeed.title}`;
          const lesson = await upsertLesson(ctx.lessons, section, {
            title,
            description: lessonSeed.description,
            type: contentType(contentSeed.type),
            file_url: stored?.file_url ?? sourceUrl,
            content: contentSeed.content ?? null,
            duration: contentSeed.duration ?? null,
            quiz_id: null,
            order_index: lessonSeed.order_index * 10 + contentIndex,
          });
          allLessons.push(lesson);
        }
      }
    }

    for (const folderSeed of seed.resource_folders ?? []) {
      const folder = await upsertFolder(ctx.resourceFolders, cls, teacher, folderSeed.name);
      for (const resourceSeed of folderSeed.resources ?? []) {
        const url = resourceSeed.file_path_or_url;
        const stored = (await resolveStoredFile(ctx, cls, url, uploadCache)) ?? linkResource(resourceSeed.title, url);
        await upsertResource(ctx.resources, cls, teacher, folder, stored);
      }
    }

    const quizResults: Array<{ quiz: Quiz; question: Question; selected: string }> = [];
    for (const [index, questionSeed] of (seed.quiz?.questions ?? []).entries()) {
      const lesson = allLessons[quizLessonIndexes[index] ?? index] ?? allLessons[index] ?? allLessons[0];
      if (!lesson) continue;
      quizResults.push(
        await upsertQuizWithQuestion(
          ctx,
          cls,
          teacher,
          lesson,
          seed.quiz.title,
          questionSeed,
        ),
      );
    }

    for (const result of quizResults) {
      for (const enrolledStudent of students) {
        await upsertQuizAttempt(ctx, result.quiz, result.question, enrolledStudent, result.selected);
      }
    }

    const authorByKey = new Map<string, User>([
      ['teacher', teacher],
      ['student', student],
    ]);
    for (const [index, enrolledStudent] of students.entries()) {
      const seedKey = String(studentSeeds[index]?.key ?? '').toLowerCase();
      if (seedKey) authorByKey.set(seedKey, enrolledStudent);
      authorByKey.set(enrolledStudent.email.toLowerCase(), enrolledStudent);
    }

    for (const discussionSeed of seed.discussions ?? []) {
      await upsertDiscussion(ctx, cls, teacher, authorByKey, discussionSeed);
    }

    if (seed.assignment) {
      for (const enrolledStudent of students) {
        await upsertAssignment(ctx, cls, teacher, enrolledStudent, seed.assignment);
      }
    }

    const counts = {
      classId: cls.id,
      teacher: teacher.email,
      students: students.map(({ email }) => email),
      pendingStudents: pendingStudents.map(({ email }) => email),
      rejectedStudents: rejectedStudents.map(({ email }) => email),
      sections: await ctx.sections.count({ where: { class_id: cls.id } }),
      lessons: allLessons.length,
      quizzes: await ctx.quizzes.count({ where: { class_id: cls.id } }),
      resources: await ctx.resources.count({ where: { class_id: cls.id } }),
      discussions: await ctx.discussions.count({ where: { class_id: cls.id } }),
      assignments: await ctx.assignments.count({ where: { class_id: cls.id } }),
      uploadedFiles: uploadCache.size,
    };

    console.log(JSON.stringify({ ok: true, class: cls.name, joinCode: cls.join_code, counts }, null, 2));
  } finally {
    await app.close();
  }
}

void main();
