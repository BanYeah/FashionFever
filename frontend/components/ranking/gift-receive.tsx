
import classes from "./gift-receive.module.css";
import Image from "next/image"; // Image 컴포넌트 추가
import { Box, Group, Text, Divider} from "@mantine/core";

export function GiftReceive() {
  return (
    <Box className={classes.GiftContainer}>
      
      {/* 1. 상단 타이틀 영역 */}
      <Box className={classes.TitleBox}>
        <Text className={classes.GiftTitle}>선물을 받았어요!</Text>
      </Box>
      {/* 2. 콘텐츠 영역 (이미지 + 텍스트) */}
      <Group gap={15} align="center" wrap="nowrap" className={classes.ContentGroup}>
        <Box className={classes.GiftImageBox}>
          <Image 
            src="/images/gift.png" 
            alt="Gift Item" 
            width={80} 
            height={80}
            style={{ objectFit: 'contain' }}
          />
        </Box>
        <p className={classes.GiftItemName}>
          [VIP] 성야, 별이 내리는 거리에서 
          <br/>
          별빛이 반짝이는 소녀 아이
        </p>
      </Group>
      <Divider size={1} color="gray" />
      <Box/>
        <p className={classes.NoticeText}>
          아이템 지급을 위해, 순차적으로 친구 신청을 드릴게요!
          <br/>
          자세한 지급 현황은 공식 카페 내 게시글을 참고해 주세요.
        </p>
      </Box>
  );
}