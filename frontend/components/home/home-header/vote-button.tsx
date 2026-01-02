"use client";

import classes from "./home-header.module.css";
import Image from "next/image";
import { UnstyledButton, Stack } from "@mantine/core";

export function VoteButton() {
  return (
    <UnstyledButton className={classes.VoteButton}>
      <Stack align="center" gap={0}>
        <Image src="/images/home/heart.svg" alt="" width={28} height={28} />
        <p>투표하기</p>
      </Stack>
    </UnstyledButton>
  );
}
