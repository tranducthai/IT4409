import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClassIdToQuizzes1776002000000 implements MigrationInterface {
    name = 'AddClassIdToQuizzes1776002000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quizzes" ADD "class_id" uuid`);
        await queryRunner.query(
            `ALTER TABLE "quizzes" ADD CONSTRAINT "FK_quizzes_class_id" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quizzes" DROP CONSTRAINT "FK_quizzes_class_id"`);
        await queryRunner.query(`ALTER TABLE "quizzes" DROP COLUMN "class_id"`);
    }
}
