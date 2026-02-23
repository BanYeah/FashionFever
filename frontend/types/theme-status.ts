const STATUS_ORDER: Record<ThemeStatusType, number> = {
  PREPARING: 0,
  ENROLLING: 1,
  REVIEWING: 2,
  VOTE_READY: 3,
  VOTING: 4,
  COMPLETE_READY: 5,
  COMPLETE: 6,
};

export type ThemeStatusType =
  | "PREPARING"
  | "ENROLLING"
  | "REVIEWING"
  | "VOTE_READY"
  | "VOTING"
  | "COMPLETE_READY"
  | "COMPLETE";

export class ThemeStatus {
  status: ThemeStatusType;
  enrollStartAt: Date | null;
  reviewStartAt: Date | null;
  voteStartAt: Date | null;
  completeStartAt: Date | null;

  constructor();
  constructor(status: ThemeStatusType);
  constructor(
    status: ThemeStatusType,
    enrollStartAt: Date,
    reviewStartAt: Date,
    voteStartAt: Date,
    completeStartAt: Date,
  );

  constructor(
    status?: ThemeStatusType,
    enrollStartAt?: Date,
    reviewStartAt?: Date,
    voteStartAt?: Date,
    completeStartAt?: Date,
  ) {
    this.status = status ?? "PREPARING";
    this.enrollStartAt = enrollStartAt ?? null;
    this.reviewStartAt = reviewStartAt ?? null;
    this.voteStartAt = voteStartAt ?? null;
    this.completeStartAt = completeStartAt ?? null;
  }

  isAfterStart(other: ThemeStatusType): boolean {
    return STATUS_ORDER[this.status] >= STATUS_ORDER[other];
  }

  isBeforeStart(other: ThemeStatusType): boolean {
    return STATUS_ORDER[this.status] < STATUS_ORDER[other];
  }
}
