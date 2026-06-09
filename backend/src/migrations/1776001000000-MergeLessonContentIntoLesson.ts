import { MigrationInterface, QueryRunner } from "typeorm";

export class MergeLessonContentIntoLesson1776001000000
  implements MigrationInterface
{
  name = 'MergeLessonContentIntoLesson1776001000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "lessons" ADD "type" "public"."lesson_contents_type_enum" NOT NULL DEFAULT 'text'`,
    );
    await queryRunner.query(
      `ALTER TABLE "lessons" ADD "file_url" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "lessons" ADD "content" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "lessons" ADD "duration" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "lessons" ADD "quiz_id" uuid`,
    );

    await queryRunner.query(`DROP TABLE "lesson_contents"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "lesson_contents" ("id" SERIAL NOT NULL, "lesson_id" integer NOT NULL, "type" "public"."lesson_contents_type_enum" NOT NULL, "title" character varying NOT NULL, "file_url" character varying, "content" text, "duration" integer, "order_index" integer NOT NULL, CONSTRAINT "PK_d1b97652e81fe392bb9465cfb97" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "lesson_contents" ADD CONSTRAINT "FK_118fa95e3bfeb4fc10406f72cf1" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "quiz_id"`);
    await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "duration"`);
    await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "content"`);
    await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "file_url"`);
    await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "type"`);
  }
}
