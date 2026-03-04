import { MigrationInterface, QueryRunner } from 'typeorm';

export class RecordSchema1772503134481 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "Record" (
        "record_id"         BIGSERIAL PRIMARY KEY,
        "theme_id"          UUID NOT NULL,
        "user_id"           UUID,
        "best_sub_id"       BIGINT NOT NULL,
        "best_final_rank"   INTEGER DEFAULT NULL,
        "best_total_score"  NUMERIC(3, 2) DEFAULT 0.00,
        "user_rank"         INTEGER DEFAULT NULL,
        "best_final_score"  NUMERIC(3, 2) DEFAULT 0.00,
        "delivered_at"      TIMESTAMPTZ DEFAULT NULL,
        
        CONSTRAINT "fk_record_theme" FOREIGN KEY ("theme_id") REFERENCES "Schedule" ("theme_id") ON DELETE CASCADE,
        CONSTRAINT "fk_record_user" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE SET NULL,
        CONSTRAINT "fk_record_sub" FOREIGN KEY ("best_sub_id") REFERENCES "Submission" ("submission_id")
      );

      CREATE INDEX idx_record_theme_user_rank_asc ON "Record" (theme_id, user_rank ASC);
      CREATE INDEX idx_record_theme_not_delivered ON "Record" (theme_id, user_rank ASC) WHERE "delivered_at" = NULL;
      CREATE INDEX idx_record_theme_delivered ON "Record" (theme_id, delivered_at DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX idx_record_theme_delivered`);
    await queryRunner.query(`DROP INDEX idx_record_theme_not_delivered`);
    await queryRunner.query(`DROP INDEX idx_record_theme_user_rank_asc`);
    await queryRunner.query(`DROP TABLE "Record"`);
  }
}
