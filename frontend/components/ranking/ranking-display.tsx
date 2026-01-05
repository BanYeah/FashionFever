import classes from "./ranking.module.css";
import Image from "next/image";
import { Stack, Group, Text, Box, Divider } from "@mantine/core";
import { HeartRating } from "../heart-rating/heartrating";
import { InfoButton } from "./info-button";

export interface ScoreItem {
  label: string;
  value: number;
}

interface RankingDisplayProps {}

export function RankingDisplay({}: RankingDisplayProps) {
  const rank: number = 13;
  const totalResult: number = 4.7;
  const imageUrl: string = "/images/model.png";

  const Scores: ScoreItem[] = [
    { label: "투표 점수", value: 3.8 },
    { label: "공감 점수", value: 0.3 },
    { label: "심사위원 점수", value: 0.4 },
    { label: "랭킹 보정 점수", value: -0.15 },
  ];

  return (
    <Stack gap={0}>
      <Image
        src={imageUrl}
        alt={`Ranking ${rank}`}
        width={425}
        height={400}
        style={{ width: "100%", height: "auto", marginBottom: "3px" }}
        priority
      />

      {/* relative div */}
      <div style={{ position: "relative", width: "100%", display: "block" }}>
        <Box className={classes.RankingTag}>랭킹 #{rank}</Box>

        {/* 점수 리스트 영역 (Container) */}
        <Stack gap={0} className={classes.Container}>
          {Scores.map((item, index) => {
            let sign = "";
            if (item.label === "공감 점수" || item.label === "심사위원 점수") {
              sign = "+";
            } else if (item.label === "랭킹 보정 점수") {
              sign = item.value >= 0 ? "+" : "-";
            }
            const displayValue = Math.abs(item.value).toFixed(2);

            let labelToSignGap = 0;
            let signToNumberGap = 4;

            if (item.label === "투표 점수") {
              labelToSignGap = 88;
            } else if (item.label === "공감 점수") {
              labelToSignGap = 74;
            } else if (item.label === "심사위원 점수") {
              labelToSignGap = 48;
            } else if (item.label === "랭킹 보정 점수") {
              labelToSignGap = 25;
            }

            return (
              <Group key={index} gap={0} className={classes.Row} wrap="nowrap">
                <Group gap={4} align="center">
                  <Text className={classes.Label}>{item.label}</Text>
                  {item.label === "랭킹 보정 점수" && <InfoButton />}
                </Group>
                <Group gap={signToNumberGap} ml={labelToSignGap} align="center">
                  {sign && (
                    <Box className={classes.SignBox}>
                      <Text className={classes.Value}>{sign}</Text>
                    </Box>
                  )}
                  <Box className={classes.NumberBox}>
                    <Text className={classes.Value}>{displayValue}</Text>
                  </Box>
                </Group>
              </Group>
            );
          })}
        </Stack>
      </div>

      {/* 결과 영역 */}
      <Group
        className={classes.ResultContent}
        align="center"
        justify="space-between"
        gap={0}
      >
        <Group gap={95}>
          <p className={classes.ResultText}>결과</p>
          <p className={classes.ResultText}>{totalResult.toFixed(2)}</p>
        </Group>
        <HeartRating value={totalResult} unitH={24} unitW={27} />
      </Group>
      <Divider size={3} color="black" />
    </Stack>
  );
}
