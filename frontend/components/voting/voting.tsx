"use client";

import { Box, Stack, UnstyledButton, Text } from "@mantine/core";
import Image from "next/image";
import classes from "./voting.module.css";

export function VotingDisplay() {
  const modelImg = "/images/model.png";
  const likeIcon = "/images/voting/like.svg";
  const sameIcon = "/images/voting/same.svg";

  return (
      <Stack gap={12} px={15} py={12} style={{ position: "relative" }}>
        {/* 첫 번째 이미지 영역 */}
        <div style={{ position: "relative", width: "100%", display: "block" }}>
          <Box className={classes.ImageWrapper}>
            <Image src={modelImg} alt="Model 1" fill style={{ objectFit: 'cover' }} />
          </Box>
          
          <UnstyledButton className={classes.VoteButton} onClick={() => console.log("Top Like")}>
            <Image src={likeIcon} alt="Like Top" width={66.7} height={60} />
          </UnstyledButton>
        </div>

        {/* 두 버튼 사이 정중앙 무승부 버튼 */}
        <UnstyledButton className={classes.SameButton} onClick={() => console.log("Same")}>
        <Image src={sameIcon} alt="Same" width={50} height={50} />
      </UnstyledButton>
      
        

        {/* 두 번째 이미지 영역 */}
        <div style={{ position: "relative", width: "100%", display: "block" }}>
          <Box className={classes.ImageWrapper}>
            <Image src={modelImg} alt="Model 2" fill style={{ objectFit: 'cover' }} />
          </Box>
          
          <UnstyledButton className={classes.VoteButton} onClick={() => console.log("Bottom Like")}>
            <Image src={likeIcon} alt="Like Bottom" width={66.7} height={60} />
          </UnstyledButton>
        </div>
        {/* 검은 선 */}
      <Box className={classes.VerticalLine} />
      </Stack>

      
      
  );
}