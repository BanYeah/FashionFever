import { MigrationInterface, QueryRunner } from 'typeorm';

export class VoteSchema1771767239267 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "Vote" (
        "vote_id"       BIGSERIAL PRIMARY KEY,
        "theme_id"      UUID NOT NULL,
        "user_id"       UUID,
        "sub_id1"       BIGINT NOT NULL,
        "sub_id2"       BIGINT NOT NULL,
        "sub_id1_score" REAL DEFAULT NULL,
        "sub_id2_score" REAL DEFAULT NULL,
        "delta"         REAL DEFAULT NULL,
        "win_sub_id"    BIGINT DEFAULT NULL,
        "lose_sub_id"   BIGINT DEFAULT NULL,
        "voted_at"      TIMESTAMPTZ DEFAULT NULL,
        
        CONSTRAINT "fk_vote_theme" FOREIGN KEY ("theme_id") REFERENCES "Schedule" ("theme_id") ON DELETE CASCADE,
        CONSTRAINT "fk_vote_user" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE SET NULL,
        CONSTRAINT "fk_vote_sub1" FOREIGN KEY ("sub_id1") REFERENCES "Submission" ("submission_id"),
        CONSTRAINT "fk_vote_sub2" FOREIGN KEY ("sub_id2") REFERENCES "Submission" ("submission_id"),
        CONSTRAINT "fk_vote_win" FOREIGN KEY ("win_sub_id") REFERENCES "Submission" ("submission_id"),
        CONSTRAINT "fk_vote_lost" FOREIGN KEY ("lose_sub_id") REFERENCES "Submission" ("submission_id")
      );

      CREATE INDEX idx_vote_user_theme_completed_asc ON "Vote" (user_id, theme_id, voted_at ASC) WHERE voted_at IS NOT NULL;
      CREATE INDEX idx_vote_pending ON "Vote" (user_id, theme_id) WHERE voted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX idx_vote_pending`);
    await queryRunner.query(`DROP INDEX idx_vote_user_theme_completed_asc`);
    await queryRunner.query(`DROP TABLE "Vote"`);
  }
}
