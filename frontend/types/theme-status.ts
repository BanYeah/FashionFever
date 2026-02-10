const STATUS_ORDER: Record<ThemeStatusType, number> = {
  PREPARING: 0,
  ENROLLING: 1,
  REVIEW_READY: 2,
  REVIEWING: 3,
  VOTE_READY: 4,
  VOTING: 5,
  COMPLETE_READY: 6,
  COMPLETE: 7,
};

export type ThemeStatusType =
  | "PREPARING"
  | "ENROLLING"
  | "REVIEW_READY"
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

  isImminent(status: ThemeStatusType): boolean {
    const now = new Date();
    const ONE_HOUR_MS = 60 * 60 * 1000;
    const limitTime = new Date(now.getTime() + ONE_HOUR_MS);

    if (status === "ENROLLING" && this.enrollStartAt)
      return new Date(this.enrollStartAt) < limitTime;
    if (status === "REVIEWING" && this.reviewStartAt)
      return new Date(this.reviewStartAt) < limitTime;
    if (status === "VOTING" && this.voteStartAt)
      return new Date(this.voteStartAt) < limitTime;
    if (status === "COMPLETE" && this.completeStartAt)
      return new Date(this.completeStartAt) < limitTime;

    return false;
  }

  isReady(status: ThemeStatusType): boolean {
    return status.endsWith("_READY");
  }
}
