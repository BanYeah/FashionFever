import classes from "../classes.module.css";
import { Stack, Box } from "@mantine/core";
import { LoginInput } from "@/components/login/login-input";
import { EventSchedule } from "@/components/login/event-schedule";

interface LoginPageProps {
  params: Promise<{ minicode: string }>;
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { minicode } = await params;

  return (
    <Stack align="stretch" mt={25} ml={15} mr={15} mb={25} gap={0}>
      <div className={classes.Announce}>
        <p>
          <span>입장코드</span>는 패션 피버 운영 계정(미니 코드: oooooo)으로
          친구 신청을 주시면, 확인 후 1:1 메세지로 보내드립니다.
        </p>
      </div>
      <Stack align="stretch" mt={16} mb={16} gap={12}>
        <LoginInput disabled placeholder="미니 코드 입력" value={minicode} />
        <LoginInput placeholder="입장 코드 입력" rightButton />
      </Stack>
      <EventSchedule />
      <Box className={classes.Finish} mt={25}>
        <p>테마에 맞게 미니를 개성있게 꾸며주세요 ~ ♥</p>
      </Box>
    </Stack>
  );
}
