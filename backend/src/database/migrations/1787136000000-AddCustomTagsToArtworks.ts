import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomTagsToArtworks1787136000000 implements MigrationInterface {
  name = 'AddCustomTagsToArtworks1787136000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "artworks" ADD COLUMN IF NOT EXISTS "custom_tags" jsonb NOT NULL DEFAULT '[]'::jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "artworks" DROP COLUMN IF EXISTS "custom_tags"`,
    );
  }
}
