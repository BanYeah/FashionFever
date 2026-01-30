import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReviewerJudgeSchema1769782371102 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "Reviewer" (
        "theme_id" UUID NOT NULL PRIMARY KEY,
        "user_id"  UUID,
        
        CONSTRAINT "fk_reviewer_theme" FOREIGN KEY ("theme_id") REFERENCES "Schedule" ("theme_id") ON DELETE CASCADE,
        CONSTRAINT "fk_reviewer_user" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE SET NULL
      );

      CREATE TABLE "ThemeJudge" (
        "theme_id" UUID NOT NULL,
        "user_id"  UUID NOT NULL,
        
        PRIMARY KEY ("theme_id", "user_id"),
        
        CONSTRAINT "fk_theme_judge_theme" FOREIGN KEY ("theme_id") REFERENCES "Schedule" ("theme_id") ON DELETE CASCADE,
        CONSTRAINT "fk_theme_judge_user" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ThemeJudge"`);
    await queryRunner.query(`DROP TABLE "Reviewer"`);
  }
}
