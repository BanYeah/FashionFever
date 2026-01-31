export interface Gift {
  theme_name: string;
  gift_name: string;
  file: File;
}

export interface GiftCollection {
  heart_rate: number;
  gift_total_num: number;
  is_random: boolean;
  is_same_theme: boolean | null;
  theme_type: string | null;
  rarity: string | null;

  gifts: Gift[];
}

export interface CreateThemePayload {
  name: string;
  desc: string;
  bg_limit: number | null;

  banner: File;

  enroll_start_at: string; // ISO 문자열
  enroll_end_at: string;
  review_start_at: string;
  review_end_at: string;
  vote_start_at: string;
  vote_end_at: string;

  reviewer_minicode: string | null;
  judge_minicodes: string[];

  collections: GiftCollection[];
}
