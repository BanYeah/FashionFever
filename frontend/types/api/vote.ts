/* GET */
export interface VoteData {
  vote_id: string;
  sub_id1: string;
  sub_id2: string;
  winP1?: number;
  winP2?: number;
  topP1?: string;
  topP2?: string;
  vote_point: number;
}

export interface VoteStatusData {
  best_rank: number | null;
  vote_point: number;
}

/* POST */
export interface VotePayload {
  vote_id: string | null;
  sub_id1: string | null;
  sub_id2: string | null;
  winner_side: number | null;
}
