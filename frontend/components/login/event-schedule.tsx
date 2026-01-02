import classes from "./event-schedule.module.css";
import Image from "next/image";
import { Stack } from "@mantine/core";

export function EventSchedule() {
  return (
    <div className={classes.ScheduleWrapper}>
      <Image
        className={classes.Image}
        src="/images/login/fashionmini.png"
        alt=""
        width={263}
        height={257}
      />
      <div className={classes.ScheduleEmpty} />
      <Stack className={classes.Schedule} align="center" gap={6}>
        <p style={{ color: "var(--highlight)", fontSize: "16px" }}>
          이벤트 기간 : 1월 10일(토) ~ 1월 16일(금)
        </p>
        <p style={{ color: "var(--main)", fontSize: "14px" }}>
          (자세한 일정은 공식 카페 내 게시글을 참고해 주세요!)
        </p>
      </Stack>
    </div>
  );
}
