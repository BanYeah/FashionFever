import classes from "./event-schedule.module.css";
import Image from "next/image";
import { Stack } from "@mantine/core";
import { getTimeline } from "@/utils/api/schedule";

export function EventSchedule() {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const formatter = new Intl.DateTimeFormat("ko-KR", {
      month: "numeric",
      day: "numeric",
      weekday: "short",
      timeZone: "Asia/Seoul",
    });

    const parts = formatter.formatToParts(date);

    // { month: '2', day: '6', weekday: '금' } 형태의 객체로 변환
    const dateObj = parts.reduce(
      (acc, part) => {
        acc[part.type] = part.value;
        return acc;
      },
      {} as Record<string, string>,
    );
    const { month, day, weekday } = dateObj;

    return `${month}월 ${day}일(${weekday})`;
  };

  const timeline = async () => {
    const result = await getTimeline();
    if (!result.success) return "조회 실패";

    const startAt = result.data.min_enroll_start_at;
    const endAt = result.data.max_complete_start_at;

    if (startAt === null && endAt === null) return "종료";
    return `${formatDate(startAt)} ~ ${formatDate(endAt)}`;
  };

  return (
    <div className={classes.ScheduleWrapper}>
      <Image
        className={classes.Image}
        src="/images/login/fashionmini.png"
        alt=""
        width={263}
        height={257}
        priority
      />
      <div className={classes.ScheduleEmpty} />
      <Stack className={classes.Schedule} align="center" gap={6}>
        <p style={{ color: "var(--highlight)", fontSize: "16px" }}>
          이벤트 기간 : {timeline()}
        </p>
        <p style={{ color: "var(--main)", fontSize: "14px" }}>
          (자세한 일정은 공식 카페 내 게시글을 참고해 주세요!)
        </p>
      </Stack>
    </div>
  );
}
