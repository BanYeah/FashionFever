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
