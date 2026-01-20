import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVehicleStatus1768904448203 implements MigrationInterface {
    name = 'AddVehicleStatus1768904448203'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."vehicles_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD "status" "public"."vehicles_status_enum" NOT NULL DEFAULT 'PENDING'`);
        await queryRunner.query(`CREATE TYPE "public"."vehicles_supervisoractiontype_enum" AS ENUM('APPROVE', 'REJECT')`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD "supervisorActionType" "public"."vehicles_supervisoractiontype_enum"`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD "supervisorActionAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD "supervisorActionReason" character varying(128)`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD "supervisorActionBy" uuid`);
        await queryRunner.query(`
            UPDATE "vehicles"
                 SET status = \'APPROVED\'
                 WHERE "isApproved" = true
        `);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "isApproved"`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD CONSTRAINT "FK_db01e5daeb1989e72158aab5ef4" FOREIGN KEY ("supervisorActionBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vehicles" DROP CONSTRAINT "FK_db01e5daeb1989e72158aab5ef4"`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD "isApproved" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`
            UPDATE "vehicles"
                 SET "isApproved" = true
                 WHERE status = \'APPROVED\'
        `);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "supervisorActionBy"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "supervisorActionReason"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "supervisorActionAt"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "supervisorActionType"`);
        await queryRunner.query(`DROP TYPE "public"."vehicles_supervisoractiontype_enum"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."vehicles_status_enum"`);
    }

}
