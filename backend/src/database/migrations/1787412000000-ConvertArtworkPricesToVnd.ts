import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertArtworkPricesToVnd1787412000000 implements MigrationInterface {
  name = 'ConvertArtworkPricesToVnd1787412000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "orders" o SET "subtotal" = "subtotal" * 26000, "shipping_cost" = "shipping_cost" * 26000, "total_amount" = "total_amount" * 26000 FROM "artworks" a WHERE o."artwork_id" = a."id" AND a."currency" = 'USD'`,
    );
    await queryRunner.query(
      `UPDATE "artworks" SET "price" = "price" * 26000, "currency" = 'VND' WHERE "currency" = 'USD' AND "price" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "orders" o SET "subtotal" = "subtotal" / 26000, "shipping_cost" = "shipping_cost" / 26000, "total_amount" = "total_amount" / 26000 FROM "artworks" a WHERE o."artwork_id" = a."id" AND a."currency" = 'VND'`,
    );
    await queryRunner.query(
      `UPDATE "artworks" SET "price" = "price" / 26000, "currency" = 'USD' WHERE "currency" = 'VND' AND "price" IS NOT NULL`,
    );
  }
}
