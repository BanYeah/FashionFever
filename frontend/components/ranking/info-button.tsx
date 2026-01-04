"use client";

import classes from "./ranking.module.css";
import Image from "next/image";

import { useDisclosure } from "@mantine/hooks";
import { UnstyledButton, Stack } from "@mantine/core";
import { ModalNoti } from "@/components/modal/model-noti";

export function InfoButton() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <ModalNoti icon="info" opened={opened} close={close}>
        <Stack
          gap={0}
          align="center"
          style={{ textAlign: "center", lineHeight: "1.5" }}
        >
          <p>최종 점수는 투표 및 공감/심사위원 점수를</p>
          <p>합산하여 산출됩니다.</p>
          <br />
          <p>
            단, <span style={{ color: "var(--main)" }}>한정된 수량</span>의 선물
            지급 인원을
          </p>
          <p>공정하게 선발하기 위해,</p>
          <p>
            랭킹에 따른{" "}
            <span style={{ color: "var(--main)" }}>랭킹 보정 점수</span>가
            적용됩니다.
          </p>
        </Stack>
      </ModalNoti>

      <UnstyledButton className={classes.InfoButton} onClick={open}>
        <Image src="/images/ranking/info.svg" alt="" width={16} height={16} />
      </UnstyledButton>
    </>
  );
}
