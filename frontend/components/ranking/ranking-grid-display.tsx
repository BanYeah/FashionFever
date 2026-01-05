"use client";

import classes from "./ranking-grid.module.css";
import {
  SimpleGrid,
  Box,
  Text,
  Group,
  Stack,
  Modal,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Image from "next/image";
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
            width={500}
            height={400}
            className={classes.ModalImage}
          />
        </Box>
      </Modal>

      <Stack gap={8} className={classes.CardWrapper}>
        <Box style={{ position: "relative" }}>
          {/* 이미지 영역 */}
          <Box className={classes.ImageArea}>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="rank item"
                fill
                style={{ objectFit: "cover" }}
              />
            ) : (
              <Box className={classes.Placeholder} />
            )}
          </Box>

          {/* 우측 하단 확대 버튼 */}
          <UnstyledButton className={classes.MagnifyButton} onClick={open}>
            <Image
              src="/images/ranking/magnify.svg"
              alt="Magnify"
              width={24}
              height={24}
            />
          </UnstyledButton>

          {/* 이미지 밖으로 삐져나오는 랭킹 태그 */}
          <Box className={classes.RankTag}>#{rank}</Box>
        </Box>

        {/* 하단 정보 영역 */}
        <Group align="center" gap={8} pl={8}>
          <Box className={classes.CustomHeart}>
            <HeartRating value={score} unitH={22} unitW={25} />
          </Box>
          <Text className={classes.ScoreText}>{score.toFixed(2)}</Text>
        </Group>
      </Stack>
    </>
  );
}

export function RankingGrid() {
  const dummyData = Array(10).fill({
    rank: 1,
    score: 5.0,
    imageUrl: "/images/model.png",
  });

  return (
    <Box className={classes.GridContainer}>
      <SimpleGrid cols={2} spacing={10} verticalSpacing={30}>
        {dummyData.map((data, index) => (
          <RankingCard
            key={index}
            rank={data.rank}
            score={data.score}
            imageUrl={data.imageUrl}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
}
