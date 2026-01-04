import classes from "./ranking.module.css";
import { Stack, Group, Text, Box } from "@mantine/core";
import Image from "next/image";
import { HeartRating } from "../heart-rating/heartrating";
import { RankingTag } from "./ranking-tag";
import { InfoButton } from "./info-button";

export interface ScoreItem {
  label: string;
  value: string;
}

interface RankingDisplayProps {}

export function RankingDisplay({}: RankingDisplayProps) {
  const rank: number = 13;
  const totalResult: number = 4.7;
  const imageUrl: string = "/images/ranking/model.png";

  const Scores: ScoreItem[] = [
    { label: "투표 점수", value: "3.80" },
    { label: "공감 점수", value: "+ 0.30" },
    { label: "심사위원 점수", value: "+ 0.40" },
    { label: "랭킹 보정 점수", value: "- 0.15" },
  ];

  return (
    <Box className={classes.Wrapper} mb={0}>
      <Box className={classes.ImageSection}>
        <Image
          src={imageUrl}
          alt={`Ranking ${rank}`}
          width={425}
          height={400}
          layout="responsive"
          priority
        />
        <RankingTag rank={rank} />
      </Box>

      {/* 점수 리스트 영역 */}
      <Stack gap={0} className={classes.Container}>
        {Scores.map((item, index) => {
          const hasSign = item.value.includes("+") || item.value.includes("-");
          const sign = hasSign ? item.value.split(" ")[0] : "";
          const number = hasSign ? item.value.split(" ")[1] : item.value;

          return (
            <Group key={index} justify="space-between" className={classes.Row}>
              {/* 텍스트 영역: '랭킹 보정 점수'일 때만 옆에 InfoButton 배치 */}
              <Group gap={4} align="center">
                <Text className={classes.Label}>{item.label}</Text>
                {item.label === "랭킹 보정 점수" && <InfoButton />}
              </Group>

              <Group gap={0}>
                <Box className={classes.SignBox}>
                  <Text className={classes.Value}>{sign}</Text>
                </Box>
                <Box className={classes.NumberBox}>
                  <Text className={classes.Value}>{number}</Text>
                </Box>
              </Group>
            </Group>
          );
        })}
      </Stack>

      {/* 결과 영역 (글자+숫자 / 하트) */}
      <Box className={classes.ResultWrapper}>
        <Group
          gap={0}
          justify="space-between"
          align="center"
          className={classes.ResultContent}
        >
          <Group gap={95} align="baseline">
            <Text className={classes.ResultLabel}>결과</Text>
            <Text className={classes.ResultValue}>
              {totalResult.toFixed(2)}
            </Text>
          </Group>
          <HeartRating value={totalResult} unitH={24} unitW={27} />
        </Group>
        <Box className={classes.BlackLine} />
      </Box>
    </Box>
  );
}
