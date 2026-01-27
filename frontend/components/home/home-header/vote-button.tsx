"use client";

import classes from "./home-header.module.css";
import Image from "next/image";
import Link from "next/link";
import { useDisclosure } from "@mantine/hooks";
import { useAuthStore } from "@/utils/store/authStore";
import { UnstyledButton, Stack } from "@mantine/core";
import { ModalNoti } from "@/components/common/modal/model-noti";

export function VoteButton() {
  const [notiOpened, { open: openNoti, close: closeNoti }] =
    useDisclosure(false);

  const { user } = useAuthStore.getState();
  if (user?.account === "user") {
    return (
      <>
        <ModalNoti icon="alert" opened={notiOpened} close={closeNoti}>
          <>
            <p>현재 투표가 진행 중인 테마가 없어요!</p>
            <p>다음 테마가 열릴 때까지 조금만 기다려 주세요.</p>
          </>
        </ModalNoti>

        <UnstyledButton className={classes.VoteButton} onClick={openNoti}>
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
      </>
    );
  } else if (user?.account == "judge") {
    return (
      <>
        <ModalNoti icon="alert" opened={notiOpened} close={closeNoti}>
          <>
            <p>현재 심사가 진행 중인 테마가 없어요!</p>
            <p>다음 테마가 열릴 때까지 조금만 기다려 주세요.</p>
          </>
        </ModalNoti>

        <UnstyledButton className={classes.VoteButton} onClick={openNoti}>
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
      </>
    );
  } else if (user?.account == "admin") {
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
