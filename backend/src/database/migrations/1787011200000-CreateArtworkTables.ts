import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArtworkTables1787011200000 implements MigrationInterface {
  name = 'CreateArtworkTables1787011200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `DO $$ BEGIN
        CREATE TYPE "public"."artworks_status_enum" AS ENUM('DRAFT', 'ACTIVE', 'SOLD', 'RESERVED', 'INACTIVE', 'DELETED', 'PENDING_REVIEW');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "tags" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "artworks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "seller_id" uuid NOT NULL, "title" character varying(100) NOT NULL, "description" text, "price" numeric(12,2), "currency" character varying(10), "status" "public"."artworks_status_enum" NOT NULL DEFAULT 'DRAFT', "is_published" boolean NOT NULL DEFAULT false, "images" jsonb NOT NULL DEFAULT '[]'::jsonb, "folder_id" uuid, "view_count" integer NOT NULL DEFAULT 0, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "materials" character varying(80), "dimensions" jsonb, "weight" numeric(10,2), CONSTRAINT "PK_e452ea65fb5958274badfe245de" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "artwork_tags" ("artwork_id" uuid NOT NULL, "tag_id" uuid NOT NULL, CONSTRAINT "PK_68e37eddbe48a633de9b70ca5fb" PRIMARY KEY ("artwork_id", "tag_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_833f5b29b7d30192e1677c05a7" ON "artwork_tags" ("artwork_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_a9b52b87e31816112be6a1a619" ON "artwork_tags" ("tag_id")`,
    );
    await queryRunner.query(
      `DO $$ BEGIN
        ALTER TABLE "artwork_tags" ADD CONSTRAINT "FK_833f5b29b7d30192e1677c05a76" FOREIGN KEY ("artwork_id") REFERENCES "artworks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN
        ALTER TABLE "artwork_tags" ADD CONSTRAINT "FK_a9b52b87e31816112be6a1a6198" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "artwork_tags" DROP CONSTRAINT IF EXISTS "FK_a9b52b87e31816112be6a1a6198"`,
    );
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "artwork_tags" DROP CONSTRAINT IF EXISTS "FK_833f5b29b7d30192e1677c05a76"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_a9b52b87e31816112be6a1a619"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_833f5b29b7d30192e1677c05a7"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "artwork_tags"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "artworks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tags"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."artworks_status_enum"`,
    );
  }
}
