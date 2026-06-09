import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClassResourceOrderIndex1778400000000 implements MigrationInterface {
  name = 'AddClassResourceOrderIndex1778400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "class_resources" ADD COLUMN IF NOT EXISTS "order_index" integer NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `UPDATE "class_resources" SET "order_index" = 1 WHERE "order_index" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "class_resources" DROP COLUMN IF EXISTS "order_index"`,
    );
  }
}
