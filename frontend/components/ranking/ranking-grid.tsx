"use client";

import classes from "./ranking-grid.module.css";
import Image from "next/image";
import { useDisclosure } from "@mantine/hooks";
import {
  SimpleGrid,
  Box,
  Text,
  Group,
  Stack,
  Modal,
  UnstyledButton,
} from "@mantine/core";
import { HeartRating } from "../common/heart-rating/heartrating";

interface RankingCardProps {
  rank: number;
  score: number;
  imageUrl?: string;
}

function RankingCard({ rank, score, imageUrl }: RankingCardProps) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      {/* 모달 영역 */}
      <Modal
        opened={opened}
        onClose={close}
        centered
        size="auto"
        withCloseButton={false}
        padding={0}
      >
        <Box className={classes.ModalImageWrapper}>
          <Image
            src="/images/model.png"
            alt="Zoomed Rank Item"
            width={390}
            height={312}
            style={{ width: "100%", height: "auto" }}
          />
        </Box>
      </Modal>

      <Stack gap={8} className={classes.CardWrapper}>
        {/* 이미지 영역 */}
        <Box className={classes.ImageArea}>
          <Image
            src={"/images/model.png"}
            alt="rank item"
            width={180}
            height={144}
            style={{ objectFit: "cover", width: "100%", height: "auto" }}
          />
          {/* 우측 하단 확대 버튼 */}
          <UnstyledButton className={classes.MagnifyButton} onClick={open}>
            <Image
              src="/images/ranking/magnify.svg"
              alt="Magnify"
              width={24}
              height={24}
            />
          </UnstyledButton>
        </Box>

        {/* 이미지 밖으로 삐져나오는 랭킹 태그 */}
        <Box className={classes.RankTag}>#{rank}</Box>

        {/* 하단 정보 영역 */}
        <Group align="center" gap={8} pl={8} className={classes.CustomHeart}>
          <HeartRating value={score} unitH={22} unitW={25} />

          <Text className={classes.ScoreText}>{score.toFixed(2)}</Text>
        </Group>
      </Stack>
    </>
  );
}

export function RankingGrid() {
  const dummyData = Array(6).fill({
    rank: 1,
    score: 5.0,
    imageUrl: "/images/model.png",
  });

  return (
    <SimpleGrid cols={2} spacing={10} verticalSpacing={30} p={10}>
      {dummyData.map((data, index) => (
        <RankingCard
          key={index}
          rank={data.rank}
          score={data.score}
          imageUrl={data.imageUrl}
        />
      ))}
    </SimpleGrid>
  );
}
