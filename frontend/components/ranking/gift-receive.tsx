import classes from "./gift-receive.module.css";
import Image from "next/image";
import { Group, Stack, Divider } from "@mantine/core";

export function GiftReceive() {
  return (
    <Stack pb={20} gap={8}>
      <p className={classes.GiftTitle}>선물을 받았어요!</p>

      <GiftCollection />
      <Divider size={1} color={"var(--gray-d9)"} />

      <p className={classes.NoticeText}>
        선물 전달을 위해, 순차적으로 친구 신청을 드릴게요!
        <br />
        자세한 전달 현황은 공식 카페 내 게시글을 참고해 주세요.
      </p>
    </Stack>
  );
}

function GiftCollection() {
  return (
    <Stack px={12} gap={8}>
      <Gift />
      <Gift />
      <Group className={classes.Caption} pl={108} gap={5}>
        <p>등 동일 테마</p>
        <p>
          <span>랜덤 일반 레어</span> 아이템
        </p>
      </Group>
    </Stack>
  );
}

function Gift() {
  return (
    <Group align="center" gap={8}>
      <div className={classes.ImageWrapper}>
        <Image src="/images/gift.png" alt="" width={80} height={80} />
      </div>
      <Stack className={classes.GiftCaption} gap={8}>
        <p>[VIP] 성야, 별이 내리는 거리에서</p>
        <p>별빛이 반짝이는 소녀 아이</p>
      </Stack>
    </Group>
  );
}
