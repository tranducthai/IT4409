import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClassResources1778150000000 implements MigrationInterface {
  name = 'AddClassResources1778150000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "class_resource_folders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "class_id" uuid NOT NULL, "created_by" uuid NOT NULL, "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_class_resource_folders_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "class_resources" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "class_id" uuid NOT NULL, "folder_id" uuid, "uploaded_by" uuid NOT NULL, "file_url" character varying NOT NULL, "original_name" character varying NOT NULL, "file_name" character varying NOT NULL, "mime_type" character varying NOT NULL, "size" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_class_resources_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "class_resource_folders" DROP CONSTRAINT IF EXISTS "FK_class_resource_folders_class"`);
    await queryRunner.query(`ALTER TABLE "class_resource_folders" ADD CONSTRAINT "FK_class_resource_folders_class" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "class_resource_folders" DROP CONSTRAINT IF EXISTS "FK_class_resource_folders_creator"`);
    await queryRunner.query(`ALTER TABLE "class_resource_folders" ADD CONSTRAINT "FK_class_resource_folders_creator" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "class_resources" DROP CONSTRAINT IF EXISTS "FK_class_resources_class"`);
    await queryRunner.query(`ALTER TABLE "class_resources" ADD CONSTRAINT "FK_class_resources_class" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "class_resources" DROP CONSTRAINT IF EXISTS "FK_class_resources_folder"`);
    await queryRunner.query(`ALTER TABLE "class_resources" ADD CONSTRAINT "FK_class_resources_folder" FOREIGN KEY ("folder_id") REFERENCES "class_resource_folders"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "class_resources" DROP CONSTRAINT IF EXISTS "FK_class_resources_uploader"`);
    await queryRunner.query(`ALTER TABLE "class_resources" ADD CONSTRAINT "FK_class_resources_uploader" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "class_resources" DROP CONSTRAINT "FK_class_resources_uploader"`);
    await queryRunner.query(`ALTER TABLE "class_resources" DROP CONSTRAINT "FK_class_resources_folder"`);
    await queryRunner.query(`ALTER TABLE "class_resources" DROP CONSTRAINT "FK_class_resources_class"`);
    await queryRunner.query(`ALTER TABLE "class_resource_folders" DROP CONSTRAINT "FK_class_resource_folders_creator"`);
    await queryRunner.query(`ALTER TABLE "class_resource_folders" DROP CONSTRAINT "FK_class_resource_folders_class"`);
    await queryRunner.query(`DROP TABLE "class_resources"`);
    await queryRunner.query(`DROP TABLE "class_resource_folders"`);
  }
}
