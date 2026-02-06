import { MigrationInterface, QueryRunner } from 'typeorm';

export class SubmissionSchema1770394977198 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "Submission" (
        "submission_id"   BIGSERIAL PRIMARY KEY,
        "theme_id"        UUID NOT NULL,
        "user_id"         UUID,
        "content_url"     TEXT,
        "created_at"      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        
        "is_reviewed"     BOOLEAN DEFAULT NULL,
        "reviewed_at"     TIMESTAMPTZ DEFAULT NULL,
        
        "vote_rank"       INTEGER DEFAULT NULL,
        "vote_score"      NUMERIC(3, 2) DEFAULT 0.00,
        "judge_score"     NUMERIC(3, 2) DEFAULT 0.00,
        "like_score"      NUMERIC(3, 2) DEFAULT 0.00,
        "total_score"     NUMERIC(3, 2) DEFAULT 0.00,
        
        "final_rank"      INTEGER DEFAULT NULL,
        "adj_score"       NUMERIC(3, 2) DEFAULT 0.00,
        "final_score"     NUMERIC(3, 2) DEFAULT 0.00,

        CONSTRAINT "fk_submission_theme" FOREIGN KEY ("theme_id") REFERENCES "Schedule" ("theme_id") ON DELETE CASCADE,
        CONSTRAINT "fk_submission_user" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE SET NULL,
        
        CONSTRAINT "chk_scores" CHECK (
            "vote_score" BETWEEN 0 AND 4.00 AND
            "judge_score" BETWEEN 0 AND 0.50 AND
            "like_score" BETWEEN 0 AND 0.50 AND
            "total_score" BETWEEN 0 AND 5.00 AND
            "final_score" BETWEEN 0 AND 5.00
        )
      );

      CREATE INDEX idx_submission_user ON "Submission" ("user_id");

      CREATE INDEX idx_submission_theme_user_final_rank ON "Submission" ("theme_id", "user_id", "final_rank" ASC);
      CREATE INDEX idx_submission_theme_final_rank ON "Submission" ("theme_id", "final_rank" ASC);

      CREATE INDEX idx_submission_review ON "Submission" ("theme_id", "is_reviewed", "reviewed_at" DESC);
      CREATE INDEX idx_submission_review_status ON "Submission" ("theme_id", "is_reviewed") WHERE "is_reviewed" = FALSE;

      CREATE INDEX idx_submission_final_ranking ON "Submission" (
          "theme_id", 
          "total_score" DESC, 
          "vote_rank" ASC, 
          "created_at" ASC
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX idx_submission_final_ranking`);
    await queryRunner.query(`DROP INDEX idx_submission_review_status`);
    await queryRunner.query(`DROP INDEX idx_submission_review`);
    await queryRunner.query(`DROP INDEX idx_submission_theme_final_rank`);
    await queryRunner.query(`DROP INDEX idx_submission_theme_user_final_rank`);
    await queryRunner.query(`DROP INDEX idx_submission_user`);
    await queryRunner.query(`DROP TABLE "Submission"`);
  }
}
