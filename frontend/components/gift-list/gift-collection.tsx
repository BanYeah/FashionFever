import classes from "./gift-collection.module.css";
import Image from "next/image";
import { Group, Stack, Divider } from "@mantine/core";
import { HeartRating } from "../common/heart-rating/heartrating";
import { GiftCollectionData, GiftData } from "@/types/api/theme";

export function GiftCollection({ data }: { data: GiftCollectionData }) {
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
    <Stack gap={8}>
      <Group gap={8}>
        <HeartRating value={data.heart_rate} unitW={25} unitH={22} />
        <p>{data.heart_rate.toFixed(2)}</p>
      </Group>
      {data.gifts.map((gift, idx) => (
        <Gift key={`${idx}_${gift.gift_name}`} data={gift} />
      ))}
      {data.is_random && (
        <Group className={classes.Caption} pl={133} pr={8} gap={5}>
          <p>등 {sameTheme}</p>
          <p>
            <span>
              {random} {themeType} {rarity}
            </span>{" "}
            아이템
          </p>
        </Group>
      )}
      <Divider size={1} color={"var(--gray-d9)"} />
    </Stack>
  );
}

function Gift({ data }: { data: GiftData }) {
  return (
    <Group align="center" gap={8}>
      <div className={classes.ImageWrapper}>
        <Image src={data.gift_url} alt="" width={80} height={80} />
      </div>
      <Stack className={classes.GiftCaption} pr={8} gap={8}>
        <p>{data.theme_name}</p>
        <p>{data.gift_name}</p>
      </Stack>
    </Group>
  );
}
