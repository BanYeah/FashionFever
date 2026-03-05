import { MigrationInterface, QueryRunner } from 'typeorm';

export class GiftSchema1769778560079 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "GiftCollection" (
        "gift_collection_id"  BIGSERIAL PRIMARY KEY,
        "theme_id"            UUID NOT NULL,
        "heart_rate"          NUMERIC(3, 2) NOT NULL,
        "gift_total_num"      INTEGER NOT NULL,
        "is_random"           BOOLEAN NOT NULL,
        "is_same_theme"       BOOLEAN,
        "theme_type"          VARCHAR(6),
        "rarity"              VARCHAR(2),
        
        CONSTRAINT "chk_type_enum" CHECK (
          "theme_type" IN ('NORMAL', 'VIP', 'LUCK', 'CASH')
        ),
        
        CONSTRAINT "chk_rarity_enum" CHECK (
          "rarity" IN ('N', 'R', 'SR')
        ),
        
        CONSTRAINT "fk_gift_collection_theme" FOREIGN KEY ("theme_id") REFERENCES "Schedule" ("theme_id") ON DELETE CASCADE
      );

      CREATE INDEX idx_gift_collection_theme_heart_rate ON "GiftCollection" ("theme_id", "heart_rate" DESC);

      CREATE TABLE "Gift" (
        "gift_id"             BIGSERIAL PRIMARY KEY,
        "gift_collection_id"  BIGSERIAL NOT NULL,
        "theme_name"          TEXT NOT NULL,
        "gift_name"           TEXT NOT NULL,
        "gift_url"            TEXT NOT NULL,
        "collection_order"    INTEGER NOT NULL,
        
        CONSTRAINT "fk_gift_collection_detail" FOREIGN KEY ("gift_collection_id") REFERENCES "GiftCollection" ("gift_collection_id") ON DELETE CASCADE
      );
      
      CREATE INDEX idx_gift_collection_id_order ON "Gift" ("gift_collection_id", "collection_order" ASC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX idx_gift_collection_id_order`);
    await queryRunner.query(`DROP TABLE "Gift"`);
    await queryRunner.query(`DROP INDEX idx_gift_collection_theme_heart_rate`);
    await queryRunner.query(`DROP TABLE "GiftCollection"`);
  }
}
