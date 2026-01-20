import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveIndexRCNumberOnVehicles1766565854393 implements MigrationInterface {
    name = 'RemoveIndexRCNumberOnVehicles1766565854393'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."Vehicle RC Number"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "Vehicle RC Number" ON "vehicles" ("rcNumber") `);
    }

}
