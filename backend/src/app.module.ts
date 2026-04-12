import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClassMembersModule } from './modules/class-members/class-members.module';
import { ClassesModule } from './modules/classes/classes.module';
import { ContentPagesModule } from './modules/content-pages/content-pages.module';
import { ContentsModule } from './modules/contents/contents.module';
import { DiscussionsModule } from './modules/discussions/discussions.module';
import { InstructorProfilesModule } from './modules/instructor-profiles/instructor-profiles.module';
import { LessonContentsModule } from './modules/lesson-contents/lesson-contents.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { MessagesModule } from './modules/messages/messages.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { SectionsModule } from './modules/sections/sections.module';
import { StudentProfilesModule } from './modules/student-profiles/student-profiles.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { UsersModule } from './modules/users/users.module';
import { WeeksModule } from './modules/weeks/weeks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        if (databaseUrl) {
          const sslEnabled =
            config.get<string>('PG_SSL', 'true').toLowerCase() !== 'false';
          const ssl = sslEnabled ? { rejectUnauthorized: false } : undefined;

          return {
            type: 'postgres' as const,
            url: databaseUrl,
            ssl,
            extra: sslEnabled ? { ssl: { rejectUnauthorized: false } } : {},
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            autoLoadEntities: false,
            synchronize: false,
          };
        }

        return {
          type: 'mysql' as const,
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 3306),
          username: config.get<string>('DB_USER', 'root'),
          password: config.get<string>('DB_PASS', ''),
          database: config.get<string>('DB_NAME', 'online_learning'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          autoLoadEntities: false,
          synchronize: false,
        };
      },
    }),
    AuthModule,
    UsersModule,
    StudentProfilesModule,
    InstructorProfilesModule,
    ClassesModule,
    ClassMembersModule,
    SectionsModule,
    LessonsModule,
    LessonContentsModule,
    WeeksModule,
    ContentsModule,
    ContentPagesModule,
    QuizModule,
    DiscussionsModule,
    MessagesModule,
    AssignmentsModule,
    SubmissionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
