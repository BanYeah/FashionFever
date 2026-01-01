import classes from "./classes.module.css";
import Image from "next/image";
import { Stack } from "@mantine/core";
import { LoginInput } from "@/components/login/login-input";

export default function LoginPage() {
  const onEvent: boolean = true;
  const startEvent: Date = new Date(2026, 0, 10);
  const endEvent: Date = new Date(2026, 0, 16);

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <Stack align="center" gap={16} mt={25} ml={15} mr={15}>
      <Stack className={classes.Announce} gap={0}>
        <p>안녕하세요, 반야입니다!</p>
        <p>
          2018년 4월을 끝으로 개최되지 않는 패션 피버를 비슷하게나마 즐기실 수
          있도록 이벤트를 마련했습니다. 그때의 설렘을 다시 만끽하는 시간이 되길
          바랍니다.
        </p>
      </Stack>
      <LoginInput />
      <div className={classes.ScheduleWrapper}>
        <Image
          className={classes.Image}
          src="/images/login/fashionmini.svg"
          alt=""
          width={263}
          height={257}
        />
        <div className={classes.ScheduleEmpty} />
        <Stack className={classes.Schedule} align="center" gap={6}>
          <p style={{ color: "var(--highlight)", fontSize: "16px" }}>
            {onEvent
              ? `이벤트 기간 :
                ${startEvent.getMonth() + 1}월
                ${startEvent.getDate()}일(${weekDays[startEvent.getDay()]}) ~
                ${endEvent.getMonth() + 1}월
                ${endEvent.getDate()}일(${weekDays[endEvent.getDay()]})`
              : "이벤트 종료"}
          </p>
          <p style={{ color: "var(--main)", fontSize: "14px" }}>
            (자세한 일정은 공식 카페 내 게시글을 참고해 주세요!)
          </p>
        </Stack>
      </div>
    </Stack>
  );
}
