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
      `CREATE TABLE IF NOT EXISTS "artworks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "seller_id" uuid NOT NULL, "title" character varying(100) NOT NULL, "description" text, "price" numeric(12,2), "currency" character varying(10), "status" "public"."artworks_status_enum" NOT NULL DEFAULT 'DRAFT', "is_published" boolean NOT NULL DEFAULT false, "images" jsonb NOT NULL DEFAULT '[]'::jsonb, "folder_id" uuid, "view_count" integer NOT NULL DEFAULT 0, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "materials" character varying(80), "dimensions" jsonb, "weight" numeric(10,2), CONSTRAINT "PK_71c9a30b72fe5876f1a88499219" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "artwork_tags" ("artwork_id" uuid NOT NULL, "tag_id" uuid NOT NULL, CONSTRAINT "PK_5fdb3e1957bf3b5c69d069bb929" PRIMARY KEY ("artwork_id", "tag_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_1e3cb3477dd1e2b2f6392b5ddd" ON "artwork_tags" ("artwork_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_55dc349ee75370e6152e7a4d7f" ON "artwork_tags" ("tag_id")`,
    );
    await queryRunner.query(
      `DO $$ BEGIN
        ALTER TABLE "artwork_tags" ADD CONSTRAINT "FK_1e3cb3477dd1e2b2f6392b5ddd4" FOREIGN KEY ("artwork_id") REFERENCES "artworks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN
        ALTER TABLE "artwork_tags" ADD CONSTRAINT "FK_55dc349ee75370e6152e7a4d7f0" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "artwork_tags" DROP CONSTRAINT IF EXISTS "FK_55dc349ee75370e6152e7a4d7f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "artwork_tags" DROP CONSTRAINT IF EXISTS "FK_1e3cb3477dd1e2b2f6392b5ddd4"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_55dc349ee75370e6152e7a4d7f"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_1e3cb3477dd1e2b2f6392b5ddd"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "artwork_tags"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "artworks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tags"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."artworks_status_enum"`,
    );
  }
}
