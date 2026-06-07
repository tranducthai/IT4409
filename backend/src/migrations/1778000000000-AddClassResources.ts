import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClassResources1778000000000 implements MigrationInterface {
    name = 'AddClassResources1778000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "class_resources" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "class_id" uuid NOT NULL,
                "uploaded_by" uuid NOT NULL,
                "original_name" character varying NOT NULL,
                "file_url" character varying NOT NULL,
                "file_name" character varying NOT NULL,
                "mime_type" character varying NOT NULL,
                "size" bigint NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_class_resources" PRIMARY KEY ("id")
            )`,
        );
        await queryRunner.query(
            `ALTER TABLE "class_resources" ADD CONSTRAINT "FK_class_resources_class"
             FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "class_resources" ADD CONSTRAINT "FK_class_resources_uploader"
             FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "class_resources" DROP CONSTRAINT "FK_class_resources_uploader"`);
        await queryRunner.query(`ALTER TABLE "class_resources" DROP CONSTRAINT "FK_class_resources_class"`);
        await queryRunner.query(`DROP TABLE "class_resources"`);
    }
}
