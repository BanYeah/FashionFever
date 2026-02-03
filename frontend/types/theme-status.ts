const STATUS_ORDER: Record<ThemeStatusType, number> = {
  PREPARING: 0,
  ENROLLING: 1,
  REVIEWING: 2,
  VOTING: 3,
  RESULTING: 4,
  COMPLETE: 5,
};

export type ThemeStatusType =
  | "PREPARING"
  | "ENROLLING"
  | "REVIEWING"
  | "VOTING"
  | "RESULTING"
  | "COMPLETE";

export class ThemeStatus {
  status: ThemeStatusType;
  enrollStartAt: Date | null;
  reviewStartAt: Date | null;
  voteStartAt: Date | null;
  resultStartAt: Date | null;

  constructor();
  constructor(
    status: ThemeStatusType,
    enrollStartAt: Date,
    reviewStartAt: Date,
    voteStartAt: Date,
    resultStartAt: Date,
  );

  constructor(
    status?: ThemeStatusType,
    enrollStartAt?: Date,
    reviewStartAt?: Date,
    voteStartAt?: Date,
    resultStartAt?: Date,
  ) {
    this.status = status ?? "PREPARING";
    this.enrollStartAt = enrollStartAt ?? null;
    this.reviewStartAt = reviewStartAt ?? null;
    this.voteStartAt = voteStartAt ?? null;
    this.resultStartAt = resultStartAt ?? null;
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
    if (status === "RESULTING" && this.resultStartAt)
      return new Date(this.resultStartAt) < limitTime;

    return false;
  }
}
