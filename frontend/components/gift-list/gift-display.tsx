"use client";

import classes from "./gift-display.module.css";
import Image from "next/image";
import { Divider, Group, Stack } from "@mantine/core";
import { HeartRating } from "../heart-rating/heartrating";

export function GiftDisplay() {
  return (
    <Stack gap={8}>
      <Group gap={8}>
        <HeartRating value={5.0} unitW={25} unitH={22} />
        <p>5.00</p>
      </Group>
      <GiftUnit />
      <GiftUnit />
      <Group className={classes.Caption} pl={133} pr={8} gap={5}>
        <p>등 동일 테마</p>
        <p>
          <span>랜덤 일반 레어</span> 아이템
        </p>
      </Group>
      <Divider size={1} color={"var(--gray-d9)"} />
    </Stack>
  );
}

function GiftUnit() {
  return (
    <Group align="center" gap={8}>
      <div className={classes.ImageWrapper}>
        <Image src="/images/gift.png" alt="" width={80} height={80} />
      </div>
      <Stack className={classes.GiftCaption} pr={8} gap={8}>
        <p>[VIP] 성야, 별이 내리는 거리에서</p>
        <p>별빛이 반짝이는 소녀 아이</p>
      </Stack>
    </Group>
  );
}
