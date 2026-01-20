import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImagesSchema1767178984153 implements MigrationInterface {
    name = 'AddImagesSchema1767178984153'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "images" ("id" BIGSERIAL NOT NULL, "title" character varying(32), "url" character varying(256) NOT NULL, "vehicleId" uuid, CONSTRAINT "PK_1fe148074c6a1a91b63cb9ee3c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`
            INSERT INTO "images" ("title", "url", "vehicleId")
            SELECT
                'RC Image' AS "title",
                "rcImageUrl" AS "url",
                "id" FROM "vehicles" AS "vehicleId"
            WHERE "rcImageUrl" IS NOT NULL
        `);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "rcNumber"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "rcImageUrl"`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD CONSTRAINT "UQ_f2c2eb4d0be3f672fb2f2c182cd" UNIQUE ("vehicleNo")`);
        await queryRunner.query(`ALTER TABLE "images" ADD CONSTRAINT "FK_f8239c66e6363f66f00eb581265" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "images" DROP CONSTRAINT "FK_f8239c66e6363f66f00eb581265"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP CONSTRAINT "UQ_f2c2eb4d0be3f672fb2f2c182cd"`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD "rcImageUrl" character varying(256)`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD "rcNumber" character varying`);
        await queryRunner.query(`
            UPDATE "vehicles"
            SET "rcImageUrl" = "images"."url"
                FROM "images"
            WHERE "images"."vehicleId" = "vehicles"."id"
              AND "images"."title" = 'RC Image'
        `);
        await queryRunner.query(`DROP TABLE "images"`);
    }

}
