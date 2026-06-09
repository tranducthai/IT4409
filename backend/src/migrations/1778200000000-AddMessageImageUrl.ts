import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMessageImageUrl1778200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "image_url" text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "messages" DROP COLUMN IF EXISTS "image_url"`,
    );
  }
}
