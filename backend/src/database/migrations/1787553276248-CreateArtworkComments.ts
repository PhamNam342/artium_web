import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArtworkComments1787553276248 implements MigrationInterface {
  name = 'CreateArtworkComments1787553276248';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "artwork_comments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "artworkId" uuid NOT NULL,
        "content" text NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_9147cb4ed2f388690947fabf77f"
          PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_9d1638c0dcf70fb635efd6598f"
      ON "artwork_comments" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_3633ed237f02564101fa935f34"
      ON "artwork_comments" ("artworkId")
    `);

    await queryRunner.query(`
      ALTER TABLE "artwork_comments"
      ADD CONSTRAINT "FK_9d1638c0dcf70fb635efd6598fe"
      FOREIGN KEY ("userId")
      REFERENCES "users"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "artwork_comments"
      DROP CONSTRAINT "FK_9d1638c0dcf70fb635efd6598fe"
    `);

    await queryRunner.query(`
      DROP INDEX "public"."IDX_3633ed237f02564101fa935f34"
    `);

    await queryRunner.query(`
      DROP INDEX "public"."IDX_9d1638c0dcf70fb635efd6598f"
    `);

    await queryRunner.query(`
      DROP TABLE "artwork_comments"
    `);
  }
}
