export function formatDueIn(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();

  const diffMs = date.getTime() - now.getTime();
  if (diffMs <= 0) return "시간 종료";

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
}
