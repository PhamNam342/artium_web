import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrdersTable1787384386612 implements MigrationInterface {
    name = 'CreateOrdersTable1787384386612'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artwork_tags" DROP CONSTRAINT "FK_1e3cb3477dd1e2b2f6392b5ddd4"`);
        await queryRunner.query(`ALTER TABLE "artwork_tags" DROP CONSTRAINT "FK_55dc349ee75370e6152e7a4d7f0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1e3cb3477dd1e2b2f6392b5ddd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_55dc349ee75370e6152e7a4d7f"`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "collector_id" uuid NOT NULL, "subtotal" numeric(12,2), "artwork_id" uuid NOT NULL, "shipping_cost" numeric(12,2), "total_amount" numeric(12,2), "status" "public"."orders_status_enum" NOT NULL DEFAULT 'PENDING', "shipping_address" jsonb, "payment_status" character varying(50), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_833f5b29b7d30192e1677c05a7" ON "artwork_tags" ("artwork_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a9b52b87e31816112be6a1a619" ON "artwork_tags" ("tag_id") `);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_c594706b3486c00074a6be3e60a" FOREIGN KEY ("collector_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "artwork_tags" ADD CONSTRAINT "FK_833f5b29b7d30192e1677c05a76" FOREIGN KEY ("artwork_id") REFERENCES "artworks"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "artwork_tags" ADD CONSTRAINT "FK_a9b52b87e31816112be6a1a6198" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artwork_tags" DROP CONSTRAINT "FK_a9b52b87e31816112be6a1a6198"`);
        await queryRunner.query(`ALTER TABLE "artwork_tags" DROP CONSTRAINT "FK_833f5b29b7d30192e1677c05a76"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_c594706b3486c00074a6be3e60a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a9b52b87e31816112be6a1a619"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_833f5b29b7d30192e1677c05a7"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`CREATE INDEX "IDX_55dc349ee75370e6152e7a4d7f" ON "artwork_tags" ("tag_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_1e3cb3477dd1e2b2f6392b5ddd" ON "artwork_tags" ("artwork_id") `);
        await queryRunner.query(`ALTER TABLE "artwork_tags" ADD CONSTRAINT "FK_55dc349ee75370e6152e7a4d7f0" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "artwork_tags" ADD CONSTRAINT "FK_1e3cb3477dd1e2b2f6392b5ddd4" FOREIGN KEY ("artwork_id") REFERENCES "artworks"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
