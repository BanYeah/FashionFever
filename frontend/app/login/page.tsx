import { Flex, Stack } from "@mantine/core";
import { LoginInput } from "@/components/login/login-input";
import { EventSchedule } from "@/components/login/event-schedule";

export default function LoginPage() {
  return (
    <Stack align="stretch" mt={25} ml={15} mr={15} mb={25} gap={0}>
      <LoginInput />
      <EventSchedule />
      <Flex justify="center" mt={25}>
        <p>테마에 맞게 미니를 개성있게 꾸며주세요 ~ ♥</p>
      </Flex>
    </Stack>
  );
}
