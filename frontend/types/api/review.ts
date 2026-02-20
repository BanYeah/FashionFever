export interface ReviewData {
  submission_id: string;
  content_url: string;
}

export interface ReviewMeta {
  total: number;
  reviewed: number;
  rejected: number;
}
