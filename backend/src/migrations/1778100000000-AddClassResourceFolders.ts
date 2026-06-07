import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClassResourceFolders1778100000000 implements MigrationInterface {
    name = 'AddClassResourceFolders1778100000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "class_resource_folders" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "class_id" uuid NOT NULL,
                "created_by" uuid NOT NULL,
                "name" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_class_resource_folders" PRIMARY KEY ("id")
            )`,
        );
        await queryRunner.query(
            `ALTER TABLE "class_resource_folders"
             ADD CONSTRAINT "FK_class_resource_folders_class"
             FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "class_resource_folders"
             ADD CONSTRAINT "FK_class_resource_folders_user"
             FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "class_resources" ADD COLUMN "folder_id" uuid`,
        );
        await queryRunner.query(
            `ALTER TABLE "class_resources"
             ADD CONSTRAINT "FK_class_resources_folder"
             FOREIGN KEY ("folder_id") REFERENCES "class_resource_folders"("id") ON DELETE CASCADE`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "class_resources" DROP CONSTRAINT "FK_class_resources_folder"`);
        await queryRunner.query(`ALTER TABLE "class_resources" DROP COLUMN "folder_id"`);
        await queryRunner.query(`ALTER TABLE "class_resource_folders" DROP CONSTRAINT "FK_class_resource_folders_user"`);
        await queryRunner.query(`ALTER TABLE "class_resource_folders" DROP CONSTRAINT "FK_class_resource_folders_class"`);
        await queryRunner.query(`DROP TABLE "class_resource_folders"`);
    }
}
