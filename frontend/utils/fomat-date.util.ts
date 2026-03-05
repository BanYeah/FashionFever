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
}
