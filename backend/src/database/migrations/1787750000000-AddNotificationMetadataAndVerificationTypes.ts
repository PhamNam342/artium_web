import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationMetadataAndVerificationTypes1787750000000 implements MigrationInterface {
  name = 'AddNotificationMetadataAndVerificationTypes1787750000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."notifications_type_enum" ADD VALUE IF NOT EXISTS 'VERIFICATION_APPROVED'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."notifications_type_enum" ADD VALUE IF NOT EXISTS 'VERIFICATION_REJECTED'`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "metadata" jsonb NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN IF EXISTS "metadata"`);
  }
}
