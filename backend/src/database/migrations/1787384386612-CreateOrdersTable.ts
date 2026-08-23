import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrdersTable1787384386612 implements MigrationInterface {
  name = 'CreateOrdersTable1787384386612';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum" AS ENUM('PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "collector_id" uuid NOT NULL, "subtotal" numeric(12,2), "artwork_id" uuid NOT NULL, "shipping_cost" numeric(12,2), "total_amount" numeric(12,2), "status" "public"."orders_status_enum" NOT NULL DEFAULT 'PENDING', "shipping_address" jsonb, "payment_status" character varying(50), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_c594706b3486c00074a6be3e60a" FOREIGN KEY ("collector_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_c594706b3486c00074a6be3e60a"`,
    );
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
  }
}
