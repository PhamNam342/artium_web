import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotifications1787578848308 implements MigrationInterface {
  name = 'CreateNotifications1787578848308';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."notifications_type_enum"
      AS ENUM(
        'ARTWORK_LIKE',
        'ARTWORK_COMMENT',
        'FOLLOW',
        'MOMENT_LIKE',
        'MOMENT_COMMENT'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."notifications_entity_type_enum"
      AS ENUM(
        'ARTWORK',
        'COMMENT',
        'USER',
        'MOMENT'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "recipient_id" uuid NOT NULL,
        "actor_id" uuid,
        "type" "public"."notifications_type_enum" NOT NULL,
        "entity_type" "public"."notifications_entity_type_enum" NOT NULL,
        "entity_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "message" text NOT NULL,
        "is_read" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a"
          PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "notifications"
      ADD CONSTRAINT "FK_notifications_recipient"
      FOREIGN KEY ("recipient_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "notifications"
      ADD CONSTRAINT "FK_notifications_actor"
      FOREIGN KEY ("actor_id")
      REFERENCES "users"("id")
      ON DELETE SET NULL
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "notifications"
      DROP CONSTRAINT "FK_notifications_actor"
    `);

    await queryRunner.query(`
      ALTER TABLE "notifications"
      DROP CONSTRAINT "FK_notifications_recipient"
    `);

    await queryRunner.query(`
      DROP TABLE "notifications"
    `);

    await queryRunner.query(`
      DROP TYPE "public"."notifications_entity_type_enum"
    `);

    await queryRunner.query(`
      DROP TYPE "public"."notifications_type_enum"
    `);
  }
}
