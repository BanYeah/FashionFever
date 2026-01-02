import classes from "./classes.module.css";
import { Stack, Box } from "@mantine/core";
import { LoginInput } from "@/components/login/login-input";
import { EventSchedule } from "@/components/login/event-schedule";

export default function LoginPage() {
  return (
    <Stack align="stretch" mt={25} ml={15} mr={15} mb={25} gap={0}>
      <Stack className={classes.Announce} gap={0}>
        <p>안녕하세요, 반야입니다!</p>
        <p>
          2018년 4월을 끝으로 개최되지 않는 패션 피버를 비슷하게나마 즐기실 수
          있도록 이벤트를 마련했습니다. 그때의 설렘을 다시 만끽하는 시간이 되길
          바랍니다.
        </p>
      </Stack>
      <Stack align="stretch" mt={16} mb={16} gap={12}>
        <LoginInput placeholder="미니 코드 입력" rightButton />
      </Stack>
      <EventSchedule />
      <Box className={classes.Finish} mt={25}>
        <p>테마에 맞게 미니를 개성있게 꾸며주세요 ~ ♥</p>
      </Box>
    </Stack>
  );
}
