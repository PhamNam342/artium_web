import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocationToArtworks1787222400000 implements MigrationInterface {
  name = 'AddLocationToArtworks1787222400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "artworks" ADD COLUMN IF NOT EXISTS "location" character varying(120)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "artworks" DROP COLUMN IF EXISTS "location"`,
    );
  }
}
