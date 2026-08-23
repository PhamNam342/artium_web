import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertArtworkPricesToVnd1787412000000 implements MigrationInterface {
  name = 'ConvertArtworkPricesToVnd1787412000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "artwork_price_vnd_migration_backup" ("artwork_id" uuid NOT NULL, "price" numeric(12,2) NOT NULL, "currency" character varying(10) NOT NULL, CONSTRAINT "PK_artwork_price_vnd_migration_backup" PRIMARY KEY ("artwork_id"))`,
    );
    await queryRunner.query(
      `INSERT INTO "artwork_price_vnd_migration_backup" ("artwork_id", "price", "currency") SELECT "id", "price", "currency" FROM "artworks" WHERE "currency" = 'USD' AND "price" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_price_vnd_migration_backup" ("order_id" uuid NOT NULL, "subtotal" numeric(12,2), "shipping_cost" numeric(12,2), "total_amount" numeric(12,2), CONSTRAINT "PK_order_price_vnd_migration_backup" PRIMARY KEY ("order_id"))`,
    );
    await queryRunner.query(
      `INSERT INTO "order_price_vnd_migration_backup" ("order_id", "subtotal", "shipping_cost", "total_amount") SELECT o."id", o."subtotal", o."shipping_cost", o."total_amount" FROM "orders" o INNER JOIN "artwork_price_vnd_migration_backup" b ON b."artwork_id" = o."artwork_id"`,
    );
    await queryRunner.query(
      `UPDATE "orders" o SET "subtotal" = o."subtotal" * 26000, "shipping_cost" = o."shipping_cost" * 26000, "total_amount" = o."total_amount" * 26000 FROM "order_price_vnd_migration_backup" b WHERE o."id" = b."order_id"`,
    );
    await queryRunner.query(
      `UPDATE "artworks" a SET "price" = a."price" * 26000, "currency" = 'VND' FROM "artwork_price_vnd_migration_backup" b WHERE a."id" = b."artwork_id"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "orders" o SET "subtotal" = b."subtotal", "shipping_cost" = b."shipping_cost", "total_amount" = b."total_amount" FROM "order_price_vnd_migration_backup" b WHERE o."id" = b."order_id"`,
    );
    await queryRunner.query(
      `UPDATE "artworks" a SET "price" = b."price", "currency" = b."currency" FROM "artwork_price_vnd_migration_backup" b WHERE a."id" = b."artwork_id"`,
    );
    await queryRunner.query(`DROP TABLE "order_price_vnd_migration_backup"`);
    await queryRunner.query(`DROP TABLE "artwork_price_vnd_migration_backup"`);
  }
}
