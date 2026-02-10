import classes from "./gift-collection.module.css";
import { notFound } from "next/navigation";
import { Stack } from "@mantine/core";
import { GiftCollection } from "./gift-collection";
import { GiftCollectionData } from "@/types/api/theme";
import { getThemeGifts } from "@/utils/api/theme";

export async function GiftList({ themeId }: { themeId: string }) {
  // 선물 목록 조회
  const result = await getThemeGifts(themeId);
  if (!result.success) notFound();

  const giftCollectionData: GiftCollectionData[] = result.data.collections;

  return (
    <Stack px={15} pt={12} pb={46} gap={10}>
      {giftCollectionData.map((data) => (
        <GiftCollection key={`${themeId}_${data.heart_rate}`} data={data} />
      ))}
      <Stack gap={6}>
        <p className={classes.Notice}>
          아이템은 달성하신 <span>최고 랭킹의 스타일을 기준으로 1개만</span>{" "}
          지급됩니다.
        </p>
        <p className={classes.Notice}>
          또한, 이벤트 상황에 따라 동일한 가치를 지닌 다른 아이템으로 변경될 수
          있는 점 양해 부탁드립니다.
        </p>
      </Stack>
    </Stack>
  );
}
