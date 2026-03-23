import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateConnctorTypeEnum1774251551732 implements MigrationInterface {
    name = 'UpdateConnctorTypeEnum1774251551732'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."connectors_type_enum" RENAME TO "connectors_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."connectors_type_enum" AS ENUM('TYPE_2_AC', 'CCS2_DC', 'CHADEMO_DC', 'TYPE_1_AC', 'TYPE_6_DC', 'TYPE_7_ACDC', 'BHARAT_AC001', 'BHARAT_DC001', 'GBT_AC', 'GBT_DC', 'TYPE_6_DC/GBT_DC', 'PANTOGRAPH_DOWN', 'PANTOGRAPH_UP')`);
        await queryRunner.query(`ALTER TABLE "connectors" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "connectors" ALTER COLUMN "type" TYPE "public"."connectors_type_enum" USING "type"::"text"::"public"."connectors_type_enum"`);
        await queryRunner.query(`ALTER TABLE "connectors" ALTER COLUMN "type" SET DEFAULT 'TYPE_6_DC'`);
        await queryRunner.query(`DROP TYPE "public"."connectors_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."connectors_type_enum_old" AS ENUM('TYPE_2_AC', 'CCS2_DC', 'CHADEMO_DC', 'TYPE_1_AC', 'TYPE_6_DC', 'TYPE_7_ACDC', 'BHARAT_AC001', 'BHARAT_DC001', 'GBT_AC', 'GBT_DC', 'PANTOGRAPH_DOWN', 'PANTOGRAPH_UP')`);
        await queryRunner.query(`ALTER TABLE "connectors" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "connectors" ALTER COLUMN "type" TYPE "public"."connectors_type_enum_old" USING "type"::"text"::"public"."connectors_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "connectors" ALTER COLUMN "type" SET DEFAULT 'TYPE_6_DC'`);
        await queryRunner.query(`DROP TYPE "public"."connectors_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."connectors_type_enum_old" RENAME TO "connectors_type_enum"`);
    }

}
