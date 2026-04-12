import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClassAvatarUrl1775881761133 implements MigrationInterface {
    name = 'AddClassAvatarUrl1775881761133'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "classes" ADD "avatar_url" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "classes" DROP COLUMN "avatar_url"`);
    }

}
