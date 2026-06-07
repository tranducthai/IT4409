import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuizOpenCloseTime1778300000000 implements MigrationInterface {
  name = 'AddQuizOpenCloseTime1778300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "open_time" timestamp NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "close_time" timestamp NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "quizzes" DROP COLUMN IF EXISTS "close_time"`);
    await queryRunner.query(`ALTER TABLE "quizzes" DROP COLUMN IF EXISTS "open_time"`);
  }
}
