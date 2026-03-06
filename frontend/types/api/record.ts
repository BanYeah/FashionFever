import { GiftCollectionData } from "./theme";

export interface RecordData {
  content_url: string;
  vote_score: number;
  like_score: number;
  judge_score: number;
  adj_score: number;
  final_score: number;
  final_rank: number;
  collection?: GiftCollectionData | null;
}

export interface RankingData {
  content_url: string;
  final_score: number;
  final_rank: number;
}

export interface DeliveryData {
  record_id: string;
  minicode: string;
  best_final_score: number;
  delivered_at: string | null;
}
