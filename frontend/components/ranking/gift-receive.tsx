import classes from "./gift-receive.module.css";
import Image from "next/image";
import { Group, Stack, Divider } from "@mantine/core";
import { GiftCollectionData, GiftData } from "@/types/api/theme";

export function GiftReceive({ data }: { data?: GiftCollectionData | null }) {
  if (!data)
    return (
      <Stack pb={20} gap={8}>
        <p className={classes.GiftTitle}>선물을 받지 못했어요.</p>
        <p className={classes.NoticeText}>
          아쉽게도 이번 테마에서는 선물 랭킹에 들지 못했어요.
          <br />
          다음 테마를 기대해 주세요!
        </p>
      </Stack>
    );

  return (
    <Stack pb={20} gap={8}>
      <p className={classes.GiftTitle}>선물을 받았어요!</p>

      <GiftCollection data={data} />
      <Divider size={1} color={"var(--gray-d9)"} />

      <p className={classes.NoticeText}>
        선물 전달을 위해, 순차적으로 친구 신청을 드릴게요!
        <br />
        자세한 전달 현황은 공식 카페 내 게시글을 참고해 주세요.
      </p>
    </Stack>
  );
}

function GiftCollection({ data }: { data: GiftCollectionData }) {
  const random = data.is_random ? "랜덤" : "";
  const sameTheme = data.is_same_theme ? "동일 테마" : "";

  const themeTypeEnum: Record<string, string> = {
    NORMAL: "일반",
    VIP: "VIP",
    LUCK: "럭",
    CASH: "현질",
  };
  const themeType = data.theme_type ? themeTypeEnum[data.theme_type] : "";

  const rarityEnum: Record<string, string> = {
    N: "노멀",
    R: "레어",
    SR: "슈레",
  };
  const rarity = data.rarity ? rarityEnum[data.rarity] : "";

  return (
    <Stack px={12} gap={8}>
      {data.gifts.map((item) => (
        <Gift key={item.gift_url} data={item} />
      ))}
      {data.is_random && (
        <Group className={classes.Caption} pl={108} gap={5}>
          <p>등 {sameTheme}</p>
          <p>
            <span>
              {random} {themeType} {rarity}
            </span>{" "}
            아이템
          </p>
        </Group>
      )}
    </Stack>
  );
}

function Gift({ data }: { data: GiftData }) {
  return (
    <Group align="center" gap={8}>
      <div className={classes.ImageWrapper}>
        <Image src={data.gift_url} alt="" width={80} height={80} />
      </div>
      <Stack className={classes.GiftCaption} gap={8}>
        <p>{data.theme_name}</p>
        <p>{data.gift_name}</p>
      </Stack>
    </Group>
  );
}
