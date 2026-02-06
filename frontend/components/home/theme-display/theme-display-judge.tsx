"use client";

import classes from "./theme-display.module.css";
import Image from "next/image";
import { Flex, Group, Stack, Divider } from "@mantine/core";
import { ThemeReviewLink } from "./theme-display-admin";
import { ThemeScheduleData } from "@/types/api/theme";
import { formatDueIn } from "@/utils/format-due-in";

interface ThemeDisplayJudgeProps {
  data: ThemeScheduleData;
  registered?: boolean;
}

export function ThemeDisplayJudge({
  data,
  registered,
}: ThemeDisplayJudgeProps) {
  const render = () => {
    if (data.status === "ENROLLING")
      return (
        <Group align="center" justify="space-between" p={6} gap={0}>
          <p style={{ color: "var(--black)" }}>
            아직 미니 꾸미기가 진행 중인 테마예요!
          </p>
          <Flex align="flex-start" h={56}>
            <p style={{ color: "var(--main)" }}>
              {formatDueIn(data.review_start_at)} 남음
            </p>
          </Flex>
        </Group>
      );
    else if (data.status === "REVIEWING")
      return (
        <Group align="center" justify="space-between" p={6} gap={0}>
          {registered ? (
            <Stack pt={7} pb={7} gap={5}>
              <Group pl={3} pr={3} gap={35}>
                <p>제외된 사진</p>
                <p>23</p>
              </Group>
              <Divider size={1.5} color="var(--gray-8a)" />
              <Group pt={3} pl={3} pr={3} gap={48}>
                <p>검수 완료</p>
                <p>100/150</p>
              </Group>
            </Stack>
          ) : (
            <p>현재 검수가 진행 중인 테마예요!</p>
          )}
          <Stack align="flex-end" justify="space-between" h={56.5} gap={12}>
            <p style={{ color: "var(--main)" }}>
              {formatDueIn(data.vote_start_at)} 후 투표 시작
            </p>
            <ThemeReviewLink href="/" />
          </Stack>
        </Group>
      );
    else if (data.status === "VOTING")
      return (
        <Group align="center" justify="space-between" p={6} gap={0}>
          {registered ? (
            <Stack pt={7} pb={7} gap={5}>
              <Group pl={3} pr={3} gap={27}>
                <p>1차 심사 완료</p>
                <p>150/150</p>
              </Group>
              <Divider size={1.5} color="var(--gray-8a)" />
              <Group pt={3} pl={3} pr={3} gap={24}>
                <p>2차 심사 완료</p>
                <p>100/150</p>
              </Group>
            </Stack>
          ) : (
            <p>심사 권한이 없는 테마예요!</p>
          )}
          <Flex align="flex-start" h={56}>
            <p>결과 발표까지 {formatDueIn(data.result_start_at)}</p>
          </Flex>
        </Group>
      );
    else
      return (
        <Flex align="center" p={6} h={68} gap={0}>
          <p>심사가 종료된 테마예요!</p>
        </Flex>
      );
  };

  return (
    <Stack className={classes.Container} gap={0}>
      {/* classes.Container에서 <p> 태그의 color: var(--gray-8a); font-size: 14px로 설정 */}

      {/* 테마 배너 이미지 */}
      <div className={classes.ImageWrapper}>
        {(data.status === "REVIEWING" && registered) ||
        data.status === "VOTING" ? (
          <Stack
            className={classes.ImageDark}
            align="center"
            justify="center"
            gap={6}
          >
            <p>{data.status === "REVIEWING" ? "검 수 중" : "심 사 중"}</p>
            <Image
              src={
                data.status === "REVIEWING"
                  ? "/images/home/theme-display/clock-hour-4.svg"
                  : "/images/home/theme-display/clock-hour-10.svg"
              }
              alt=""
              width={28}
              height={28}
            />
          </Stack>
        ) : null}
        <Image
          src={data.banner_url}
          alt=""
          width={390}
          height={156}
          style={{ width: "100%", height: "auto" }}
          loading="eager"
        />
      </div>

      {render()}
    </Stack>
  );
}
