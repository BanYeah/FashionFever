"use client";

import classes from "./ranking-grid.module.css";
import Image from "next/image";
import { useDisclosure } from "@mantine/hooks";
import {
  SimpleGrid,
  Box,
  Group,
  Stack,
  Modal,
  UnstyledButton,
} from "@mantine/core";
import { HeartRating } from "../common/heart-rating/heartrating";

export function RankingGrid() {
  const dummyData = Array(6).fill({
    rank: 1,
    score: 5.0,
  });

  return (
    <SimpleGrid cols={2} spacing={10} verticalSpacing={30} p={10}>
      {dummyData.map((data, index) => (
        <RankingCard key={index} rank={data.rank} score={data.score} />
      ))}
    </SimpleGrid>
  );
}

interface RankingCardProps {
  rank: number;
  score: number;
}

function RankingCard({ rank, score }: RankingCardProps) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      {/* 모달 영역 */}
      <Modal
        opened={opened}
        onClose={close}
        size="auto"
        centered
        padding={0}
        withCloseButton={false}
      >
        <Image
          src="/images/model.png"
          alt=""
          width={390}
          height={312}
          style={{ display: "block", width: "100%", height: "auto" }}
        />
      </Modal>

      <Stack style={{ position: "relative" }} gap={8}>
        {/* 이미지 영역 */}
        <Box style={{ position: "relative" }}>
          <Image
            src={"/images/model.png"}
            alt=""
            width={180}
            height={144}
            style={{ display: "block", width: "100%", height: "auto" }}
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
        <Box className={classes.RankTag}>
          <p>#{rank}</p>
        </Box>

        {/* 하단 정보 영역 */}
        <Group className={classes.CustomHeart} align="center" gap={8} pl={8}>
          <HeartRating value={score} unitH={22} unitW={25} />
          <p>{score.toFixed(2)}</p>
        </Group>
      </Stack>
    </>
  );
}
