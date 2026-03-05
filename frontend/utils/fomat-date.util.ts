export interface DateTimeInfo {
  date: string | null; // 2026. 03. 05.
  time: string; // 17:00:00
}

export class FormatDateUtil {
  static deadline(ISOString: string): string {
    const date = new Date(ISOString);
    const now = new Date();

    const diffMs = date.getTime() - now.getTime();
    if (diffMs <= 0) return "기간 종료";

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
  }

  static dateTime(ISOString: string, offset: number = 0): DateTimeInfo {
    const date = new Date(ISOString);
    date.setTime(date.getTime() + offset);

    // 한국 시간(KST, Asia/Seoul) 기준으로 포맷터 설정
    const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // 24시간 형식 강제
    });

    return {
      date: dateFormatter.format(date),
      time: timeFormatter.format(date).replace(/\s/g, ""),
    };
  }

  static timezone(dateTime: DateTimeInfo): string | null {
    if (dateTime.date === null) return null;

    const date = dateTime.date
      .replace(/\. /g, "-") // 마침표+공백을 대시로 대체
      .replace(/\.$/, ""); // 맨 마지막 마침표 제거

    return `${date}T${dateTime.time}+09:00`;
  }

  static diff(
    start: DateTimeInfo,
    end: DateTimeInfo,
    offset: number = 0,
  ): string {
    if (start.date === null || end.date === null) return "";

    const startDate = new Date(this.timezone(start)!);
    const endDate = new Date(this.timezone(end)!);
    endDate.setTime(endDate.getTime() + offset);

    const diffMs = endDate.getTime() - startDate.getTime();

    const reversed = diffMs < 0;
    const absDiffMs = Math.abs(diffMs);

    const diffDays = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (absDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );

    const sign = reversed ? "-" : "";
    if (diffDays === 0 && diffHours === 0) return "0시간";
    if (diffDays === 0) return `${sign}${diffHours}시간`;
    return `${diffDays}일 ${diffHours}시간`;
  }
}
