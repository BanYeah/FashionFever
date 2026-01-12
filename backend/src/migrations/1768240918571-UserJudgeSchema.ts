import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserJudgeSchema1768240918571 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      CREATE TABLE "User" (
          "user_id"    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "minicode"   VARCHAR(7) NOT NULL,
          "enter_code" TEXT NOT NULL,
          "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE UNIQUE INDEX idx_user_minicode_include_enter ON "User"("minicode") INCLUDE ("enter_code");

      CREATE TABLE "Judge" (
          "user_id"    UUID PRIMARY KEY REFERENCES "User"("user_id") ON DELETE CASCADE,
          "minicode"   VARCHAR(7) NOT NULL,
          "appointed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "fk_judge_minicode" FOREIGN KEY ("minicode") REFERENCES "User"("minicode")
      );

      CREATE UNIQUE INDEX idx_judge_minicode_unique ON "Judge"("minicode");
      
      CREATE INDEX idx_user_created_at ON "User" (created_at DESC);
      CREATE INDEX idx_judge_appointed_at ON "Judge" (appointed_at DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX idx_judge_appointed_at`);
    await queryRunner.query(`DROP INDEX idx_user_created_at`);
    await queryRunner.query(`DROP INDEX idx_judge_minicode_unique`);
    await queryRunner.query(`DROP INDEX idx_user_minicode_include_enter`);
    await queryRunner.query(`DROP TABLE "Judge"`);
    await queryRunner.query(`DROP TABLE "User"`);
  }
}
