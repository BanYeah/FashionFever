export interface Gift_t {
  theme_name: string;
  gift_name: string;
  gift_file: File | string;
}

export interface GiftCollection_t {
  heart_rate: number;
  gift_total_num: number;
  is_random: boolean;
  is_same_theme: boolean | null;
  theme_type: string | null;
  rarity: string | null;

  gifts: Gift_t[];
}
