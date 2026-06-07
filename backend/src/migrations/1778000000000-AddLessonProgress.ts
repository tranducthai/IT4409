import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLessonProgress1778000000000 implements MigrationInterface {
  name = 'AddLessonProgress1778000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "lesson_progresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "class_id" uuid NOT NULL, "lesson_id" integer NOT NULL, "user_id" uuid NOT NULL, "completed_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_lesson_progresses_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_lesson_progresses_unique" ON "lesson_progresses" ("class_id", "lesson_id", "user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "lesson_progresses" ADD CONSTRAINT "FK_lesson_progresses_class" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "lesson_progresses" ADD CONSTRAINT "FK_lesson_progresses_lesson" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "lesson_progresses" ADD CONSTRAINT "FK_lesson_progresses_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "lesson_progresses" DROP CONSTRAINT "FK_lesson_progresses_user"`);
    await queryRunner.query(`ALTER TABLE "lesson_progresses" DROP CONSTRAINT "FK_lesson_progresses_lesson"`);
    await queryRunner.query(`ALTER TABLE "lesson_progresses" DROP CONSTRAINT "FK_lesson_progresses_class"`);
    await queryRunner.query(`DROP INDEX "IDX_lesson_progresses_unique"`);
    await queryRunner.query(`DROP TABLE "lesson_progresses"`);
  }
}
