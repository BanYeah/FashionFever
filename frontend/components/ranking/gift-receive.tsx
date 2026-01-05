import classes from "./gift-receive.module.css";
import Image from "next/image";
import { Box, Group, Stack, Divider } from "@mantine/core";

export function GiftReceive() {
  return (
    <Box className={classes.GiftContainer}>
      {/* 1. 상단 타이틀 영역 */}
      <p className={classes.GiftTitle}>선물을 받았어요!</p>

      {/* 2. 콘텐츠 영역 (이미지 + 텍스트) */}
      <Group gap={14} align="center" wrap="nowrap" mt={14} mb={8} ml={12}>
        <Box className={classes.GiftImageBox}>
          <Image
            src="/images/gift.png"
            alt="Gift Item"
            width={80}
            height={80}
            style={{ objectFit: "contain" }}
          />
        </Box>
        <Stack gap={8}>
          <p className={classes.GiftItemName}>
            [VIP] 성야, 별이 내리는 거리에서
          </p>
          <p className={classes.GiftItemName}>별빛이 반짝이는 소녀 아이</p>
        </Stack>
      </Group>
      <Divider size={1} color="gray" />
      <Box />
      <p className={classes.NoticeText}>
        아이템 지급을 위해, 순차적으로 친구 신청을 드릴게요!
        <br />
        자세한 지급 현황은 공식 카페 내 게시글을 참고해 주세요.
      </p>
    </Box>
  );
}
