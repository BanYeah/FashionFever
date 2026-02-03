import { MigrationInterface, QueryRunner } from 'typeorm';

export class ThemeSchema1769777066826 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "Schedule" (
        "theme_id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "enroll_start_at"   TIMESTAMPTZ NOT NULL,
        "review_start_at"   TIMESTAMPTZ NOT NULL,
        "vote_start_at"     TIMESTAMPTZ NOT NULL,
        "result_start_at"   TIMESTAMPTZ NOT NULL,
        "status"            VARCHAR(10) NOT NULL,

        CONSTRAINT "chk_timeline_order" CHECK (
          "enroll_start_at" < "review_start_at" AND 
          "review_start_at" < "vote_start_at" AND 
          "vote_start_at" < "result_start_at"
        ),
        
        CONSTRAINT "chk_status_enum" CHECK (
          "status" IN ('PREPARING', 'ENROLLING', 'REVIEWING', 'VOTING', 'RESULTING', 'COMPLETE')
        )
      );

      CREATE INDEX idx_schedule_status ON "Schedule" ("status");
      CREATE INDEX idx_schedule_enroll_start ON "Schedule" ("enroll_start_at" DESC);
      CREATE INDEX idx_schedule_period ON "Schedule" ("enroll_start_at", "result_start_at");

      CREATE TABLE "Banner" (
        "theme_id"    UUID PRIMARY KEY REFERENCES "Schedule"("theme_id") ON DELETE CASCADE,
        "banner_url"  TEXT NOT NULL
      );

      CREATE TABLE "Header" (
        "theme_id"    UUID PRIMARY KEY REFERENCES "Schedule"("theme_id") ON DELETE CASCADE,
        "name"        TEXT NOT NULL,
        "desc"        TEXT NOT NULL,
        "bg_limit"    INTEGER
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "Header"`);
    await queryRunner.query(`DROP TABLE "Banner"`);
    await queryRunner.query(`DROP INDEX idx_schedule_period`);
    await queryRunner.query(`DROP INDEX idx_schedule_enroll_start`);
    await queryRunner.query(`DROP INDEX idx_schedule_status`);
    await queryRunner.query(`DROP TABLE "Schedule"`);
  }
}
