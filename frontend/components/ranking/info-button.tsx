"use client";

import classes from "./ranking.module.css";
import Image from "next/image";
import { useNotification } from "../notification/notification";
import { UnstyledButton } from "@mantine/core";

export function InfoButton() {
  const { notify } = useNotification();
  const message = (
    <p style={{ lineHeight: "1.5" }}>
      최종 점수는 투표 및 공감/심사위원 점수를
      <br />
      합산하여 산출됩니다.
      <br />
      <br />
      단, <span style={{ color: "var(--main)" }}>한정된 수량</span>의 선물 지급
      인원을
      <br />
      공정하게 선발하기 위해,
      <br />
      랭킹에 따른 <span style={{ color: "var(--main)" }}>랭킹 보정 점수</span>가
      적용됩니다.
    </p>
  );

  return (
    <UnstyledButton
      className={classes.InfoButton}
      onClick={() => notify(message)}
    >
      <Image src="/images/ranking/info.svg" alt="" width={16} height={16} />
    </UnstyledButton>
  );
}
