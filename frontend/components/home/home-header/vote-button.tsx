"use client";

import classes from "./home-header.module.css";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/utils/store/authStore";
import { useNotification } from "@/components/notification/notification";
import { UnstyledButton, Stack } from "@mantine/core";
import { getVotingNow, getJudgingNow } from "@/utils/api/schedule";

export function VoteButton() {
  const router = useRouter();

  const { notify, notifyServerError } = useNotification();

  const { user } = useAuthStore.getState();
  if (user?.account === "user") {
    const message = (
      <>
        <p>현재 투표가 진행 중인 테마가 없어요!</p>
        <p>다음 테마가 열릴 때까지 조금만 기다려 주세요.</p>
      </>
    );

    return (
      <UnstyledButton
        className={classes.VoteButton}
        onClick={async () => {
          const result = await getVotingNow();
          if (result.success) {
            router.push(`/voting?theme_id=${result.data.theme_id}`);
            return;
          }

          switch (result.status) {
            case 404:
              notify(message);
              break;
            default:
              notifyServerError();
          }
        }}
      >
        <Stack align="center" gap={0}>
          <Image
            src="/images/home/home-shell/heart.svg"
            alt=""
            width={28}
            height={28}
          />
          <p>투표하기</p>
        </Stack>
      </UnstyledButton>
    );
  } else if (user?.account === "judge") {
    const message = (
      <>
        <p>현재 심사가 가능한 테마가 없어요!</p>
        <p>다음 테마가 열릴 때까지 조금만 기다려 주세요.</p>
      </>
    );

    return (
      <UnstyledButton
        className={classes.VoteButton}
        onClick={async () => {
          const result = await getJudgingNow();
          if (result.success) {
            router.push(`/judging?theme_id=${result.data.theme_id}`);
            return;
          }

          switch (result.status) {
            case 404:
              notify(message);
              break;
            default:
              notifyServerError();
          }
        }}
      >
        <Stack align="center" gap={0}>
          <Image
            src="/images/home/home-shell/heart.svg"
            alt=""
            width={28}
            height={28}
          />
          <p>심사하기</p>
        </Stack>
      </UnstyledButton>
    );
  } else if (user?.account === "admin") {
    return (
      <Link className={classes.VoteButton} href="/account-setting">
        <Stack align="center" gap={0}>
          <Image
            src="/images/home/home-shell/user-manage.svg"
            alt=""
            width={28}
            height={28}
          />
          <p>계정관리</p>
        </Stack>
      </Link>
    );
  }
}
