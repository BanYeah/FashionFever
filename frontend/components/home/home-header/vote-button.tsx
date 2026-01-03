"use client";

import classes from "./home-header.module.css";
import Image from "next/image";
import Link from "next/link";
import { useDisclosure } from "@mantine/hooks";
import { UnstyledButton, Stack } from "@mantine/core";
import { ModalNoti } from "@/components/modal/model-noti";

export function VoteButton() {
  const type = "user" as "user" | "judge" | "admin";
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      {type === "user" ? (
        <>
          <ModalNoti icon="alert" opened={opened} close={close}>
            <>
              <p>현재 투표가 진행 중인 테마가 없어요!</p>
              <p>다음 테마가 열릴 때까지 조금만 기다려 주세요.</p>
            </>
          </ModalNoti>

          <UnstyledButton className={classes.VoteButton} onClick={open}>
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
      ) : type === "judge" ? (
        <>
          <ModalNoti icon="alert" opened={opened} close={close}>
            <>
              <p>현재 심사가 진행 중인 테마가 없어요!</p>
              <p>다음 테마가 열릴 때까지 조금만 기다려 주세요.</p>
            </>
          </ModalNoti>

          <UnstyledButton className={classes.VoteButton} onClick={open}>
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
      ) : (
        <Link className={classes.VoteButton} href="/">
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
      )}
    </>
  );
}
