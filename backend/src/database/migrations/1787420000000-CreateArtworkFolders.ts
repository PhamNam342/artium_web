import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArtworkFolders1787420000000 implements MigrationInterface {
  name = 'CreateArtworkFolders1787420000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "artwork_folders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "seller_id" uuid NOT NULL,
        "name" character varying(100) NOT NULL,
        "parent_id" uuid,
        "is_visible" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_artwork_folders" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_artwork_folders_seller_parent" ON "artwork_folders" ("seller_id", "parent_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_artworks_folder_id" ON "artworks" ("folder_id")`,
    );
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "artwork_folders"
        ADD CONSTRAINT "FK_artwork_folders_parent"
        FOREIGN KEY ("parent_id") REFERENCES "artwork_folders"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "artworks"
        ADD CONSTRAINT "FK_artworks_folder"
        FOREIGN KEY ("folder_id") REFERENCES "artwork_folders"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "artworks" DROP CONSTRAINT IF EXISTS "FK_artworks_folder"`,
    );
    await queryRunner.query(
      `ALTER TABLE "artwork_folders" DROP CONSTRAINT IF EXISTS "FK_artwork_folders_parent"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_artworks_folder_id"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_artwork_folders_seller_parent"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "artwork_folders"`);
  }
}
