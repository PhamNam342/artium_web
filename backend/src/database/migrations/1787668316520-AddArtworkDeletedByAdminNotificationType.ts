import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddArtworkDeletedByAdminNotificationType1787668316520 implements MigrationInterface {
  name = 'AddArtworkDeletedByAdminNotificationType1787668316520';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."notifications_type_enum" ADD VALUE IF NOT EXISTS 'ARTWORK_DELETED_BY_ADMIN'`,
    );
  }

  public async down(): Promise<void> {
    // PostgreSQL does not support removing a single enum value safely.
  }
}
