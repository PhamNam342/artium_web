import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSellerProfile1787295484477 implements MigrationInterface {
  name = 'CreateSellerProfile1787295484477';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "seller_profiles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "bio" text,
        "website_url" character varying,
        "is_visible" boolean NOT NULL DEFAULT true,
        "is_verified" boolean NOT NULL DEFAULT false,
        CONSTRAINT "UQ_seller_profiles_user_id"
          UNIQUE ("user_id"),
        CONSTRAINT "PK_seller_profiles"
          PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "seller_profiles"
      ADD CONSTRAINT "FK_seller_profiles_user_id"
      FOREIGN KEY ("user_id")
      REFERENCES "users"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "seller_profiles"
      DROP CONSTRAINT "FK_seller_profiles_user_id"
    `);

    await queryRunner.query(`
      DROP TABLE "seller_profiles"
    `);
  }
}
