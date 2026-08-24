import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFollows1787411030256 implements MigrationInterface {
  name = 'CreateFollows1787411030256';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "follows" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "follower_id" uuid NOT NULL,
        "following_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_follows_id"
          PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "follows"
      ADD CONSTRAINT "FK_follows_follower"
      FOREIGN KEY ("follower_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "follows"
      ADD CONSTRAINT "FK_follows_following"
      FOREIGN KEY ("following_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_follows_follower_following"
      ON "follows" ("follower_id", "following_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "public"."IDX_follows_follower_following"
    `);

    await queryRunner.query(`
      ALTER TABLE "follows"
      DROP CONSTRAINT "FK_follows_following"
    `);

    await queryRunner.query(`
      ALTER TABLE "follows"
      DROP CONSTRAINT "FK_follows_follower"
    `);

    await queryRunner.query(`
      DROP TABLE "follows"
    `);
  }
}
