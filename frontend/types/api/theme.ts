import { ThemeStatusType } from "../theme-status";

/* GET */
export interface ThemeScheduleData {
  theme_id: string;
  banner_url: string;

  enroll_start_at: string; // ISO 문자열
  review_start_at: string;
  vote_start_at: string;
  complete_start_at: string;
  status: ThemeStatusType;
}

export interface ThemeHeaderData {
  theme_id: string;
  name: string;
  desc: string;
  bg_limit: number | null;
}

export interface GiftData {
  theme_name: string;
  gift_name: string;
  gift_url: string;
}

export interface GiftCollectionData {
  heart_rate: number;
  gift_total_num: number;
  is_random: boolean;
  is_same_theme: boolean | null;
  theme_type: string | null;
  rarity: string | null;

  gifts: GiftData[];
}

/* Theme Setting */
/* GET */
export interface ThemeData {
  name: string;
  desc: string;
  bg_limit: number | null;

  banner_url: string;

  enroll_start_at: string; // ISO 문자열
  review_start_at: string;
  vote_start_at: string;
  complete_start_at: string;
  status: ThemeStatusType;

  reviewer_minicode: string | null;
  judge_minicodes: string[];

  collections: GiftCollectionData[];
}

/* POST / PATCH */
export interface Gift {
  theme_name: string;
  gift_name: string;
  gift_file: File | string;
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

export interface ThemePayload {
  name: string;
  desc: string;
  bg_limit: number | null;

  banner: File | string;

  enroll_start_at: string; // ISO 문자열
  review_start_at: string;
  vote_start_at: string;
  complete_start_at: string;

  reviewer_minicode: string | null;
  judge_minicodes: string[];

  collections: GiftCollection[];
}
