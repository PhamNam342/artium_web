import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPayOSPaymentFields1787422800000 implements MigrationInterface {
  name = 'AddPayOSPaymentFields1787422800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE SEQUENCE "orders_payos_order_code_seq" START WITH 1000000000`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "payos_order_code" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "payos_payment_link_id" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "payos_checkout_url" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "payment_expires_at" TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "orders" ADD "paid_at" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "payment_reference" character varying(255)`,
    );
    await queryRunner.query(
      `UPDATE "orders" SET "payment_status" = 'PENDING' WHERE "payment_status" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "payment_status" SET DEFAULT 'PENDING'`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "payment_status" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "UQ_orders_payos_order_code" UNIQUE ("payos_order_code")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "UQ_orders_payos_order_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "payment_status" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "payment_status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "payment_reference"`,
    );
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "paid_at"`);
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "payment_expires_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "payos_checkout_url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "payos_payment_link_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "payos_order_code"`,
    );
    await queryRunner.query(`DROP SEQUENCE "orders_payos_order_code_seq"`);
  }
}
