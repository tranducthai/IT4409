import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAssignmentAttachmentsAndSubmissionFiles1777000000000
  implements MigrationInterface {
  name = 'AddAssignmentAttachmentsAndSubmissionFiles1777000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "assignment_attachments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "assignment_id" uuid NOT NULL, "file_url" character varying NOT NULL, "original_name" character varying NOT NULL, "file_name" character varying NOT NULL, "mime_type" character varying NOT NULL, "size" integer NOT NULL, "uploaded_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_assignment_attachments_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "assignment_submission_files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "submission_id" uuid NOT NULL, "file_url" character varying NOT NULL, "original_name" character varying NOT NULL, "file_name" character varying NOT NULL, "mime_type" character varying NOT NULL, "size" integer NOT NULL, "uploaded_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_assignment_submission_files_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "assignment_attachments" ADD CONSTRAINT "FK_assignment_attachments_assignment" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "assignment_submission_files" ADD CONSTRAINT "FK_assignment_submission_files_submission" FOREIGN KEY ("submission_id") REFERENCES "assignment_submissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "assignment_submission_files" DROP CONSTRAINT "FK_assignment_submission_files_submission"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assignment_attachments" DROP CONSTRAINT "FK_assignment_attachments_assignment"`,
    );
    await queryRunner.query(`DROP TABLE "assignment_submission_files"`);
    await queryRunner.query(`DROP TABLE "assignment_attachments"`);
  }
}
