import classes from "./ranking.module.css";
import Image from "next/image";
import { Stack, Group, Text, Box, Divider } from "@mantine/core";
import { HeartRating } from "../common/heart-rating/heartrating";
import { InfoButton } from "./info-button";
import { RecordData } from "@/types/api/record";

export function RankingDisplay({ data }: { data: RecordData }) {
  const scores = [
    { value: data.vote_score, label: "투표 점수" },
    { value: data.like_score, label: "공감 점수" },
    { value: data.judge_score, label: "심사위원 점수" },
    { value: data.adj_score, label: "랭킹 보정 점수" },
  ];

  return (
    <Stack gap={0}>
      <Image
        src={data.content_url}
        alt=""
        width={425}
        height={400}
        style={{ width: "100%", height: "auto", marginBottom: "3px" }}
        priority
      />

      {/* relative div */}
      <div style={{ position: "relative", width: "100%", display: "block" }}>
        <Box className={classes.RankingTag}>랭킹 #{data.final_rank}</Box>

        {/* 점수 리스트 영역 (Container) */}
        <Stack gap={0} className={classes.Container}>
          {scores.map((item, index) => {
            let sign = "";
            if (item.label === "공감 점수" || item.label === "심사위원 점수") {
              sign = "+";
            } else if (item.label === "랭킹 보정 점수") {
              sign = item.value >= 0 ? "+" : "-";
            }
            const absValue = Math.abs(item.value).toFixed(2);

            let labelSignGap = 0;
            if (item.label === "투표 점수") {
              labelSignGap = 88;
            } else if (item.label === "공감 점수") {
              labelSignGap = 74;
            } else if (item.label === "심사위원 점수") {
              labelSignGap = 48;
            } else if (item.label === "랭킹 보정 점수") {
              labelSignGap = 25;
            }

            return (
              <Group key={index} gap={0} className={classes.Row} wrap="nowrap">
                <Group gap={4} align="center">
                  <Text className={classes.Label}>{item.label}</Text>
                  {item.label === "랭킹 보정 점수" && <InfoButton />}
                </Group>
                <Group gap={4} ml={labelSignGap} align="center">
                  {sign && (
                    <Box className={classes.SignBox}>
                      <Text className={classes.Value}>{sign}</Text>
                    </Box>
                  )}
                  <Box className={classes.NumberBox}>
                    <Text className={classes.Value}>{absValue}</Text>
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
          <p className={classes.ResultText}>{data.final_score.toFixed(2)}</p>
        </Group>
        <HeartRating value={data.final_score} unitH={24} unitW={27} />
      </Group>
      <Divider size={3} color="black" />
    </Stack>
  );
}
