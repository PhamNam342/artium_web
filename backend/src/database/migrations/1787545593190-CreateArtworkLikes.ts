import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArtworkLikes1787545593190 implements MigrationInterface {
  name = 'CreateArtworkLikes1787545593190';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "artwork_likes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "artworkId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_artwork_likes_user_artwork"
          UNIQUE ("userId", "artworkId"),
        CONSTRAINT "PK_artwork_likes"
          PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_artwork_likes_userId"
      ON "artwork_likes" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_artwork_likes_artworkId"
      ON "artwork_likes" ("artworkId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "public"."IDX_artwork_likes_artworkId"
    `);

    await queryRunner.query(`
      DROP INDEX "public"."IDX_artwork_likes_userId"
    `);

    await queryRunner.query(`
      DROP TABLE "artwork_likes"
    `);
  }
}
