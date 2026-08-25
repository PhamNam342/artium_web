import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVerificationStatusToSellerProfile1787560000000 implements MigrationInterface {
  name = 'AddVerificationStatusToSellerProfile1787560000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."seller_profiles_verification_status_enum" AS ENUM('NONE', 'PENDING', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "seller_profiles" ADD "verification_status" "public"."seller_profiles_verification_status_enum" NOT NULL DEFAULT 'NONE'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "seller_profiles" DROP COLUMN "verification_status"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."seller_profiles_verification_status_enum"`,
    );
  }
}
