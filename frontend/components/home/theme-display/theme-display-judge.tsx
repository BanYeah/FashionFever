"use client";

import classes from "./theme-display.module.css";
import Image from "next/image";
import { Flex, Group, Stack, Divider } from "@mantine/core";
import { ThemeReviewLink } from "./theme-display-admin";

interface ThemeDisplayJudgeProps {
  variant: "open" | "pending" | "vote" | "result";
  registered?: boolean;
}

export function ThemeDisplayJudge({
  variant,
  registered,
}: ThemeDisplayJudgeProps) {
  return (
    <Stack className={classes.Container} gap={0}>
      {/* classes.Container에서 <p> 태그의 color: var(--gray-8a); font-size: 14px로 설정 */}

      {/* 테마 배너 이미지 */}
      <div className={classes.ImageWrapper}>
        {(variant === "pending" && registered) || variant === "vote" ? (
          <Stack
            className={classes.ImageDark}
            align="center"
            justify="center"
            gap={6}
          >
            <p>{variant === "pending" ? "검 수 중" : "심 사 중"}</p>
            <Image
              src={
                variant === "pending"
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
          src="/images/home/theme-display/image.png"
          alt=""
          width={390}
          height={156}
          style={{ width: "100%", height: "auto" }}
        />
      </div>

      {/* 참가 상태 */}
      {variant === "open" ? (
        // 모 집 중
        <Group align="center" justify="space-between" p={6} gap={0}>
          <p style={{ color: "var(--black)" }}>
            아직 미니 꾸미기가 진행 중인 테마예요!
          </p>
          <Flex align="flex-start" h={56}>
            <p style={{ color: "var(--main)" }}>23시간 35분 남음</p>
          </Flex>
        </Group>
      ) : variant === "pending" && registered ? (
        // 검 수 중 (검수 권한 O)
        <Group align="center" justify="space-between" p={6} gap={0}>
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
          <Stack align="flex-end" justify="space-between" gap={12}>
            <p style={{ color: "var(--main)" }}>7시간 15분 후 투표 시작</p>
            <ThemeReviewLink href="/" />
          </Stack>
        </Group>
      ) : variant === "pending" ? (
        // 검 수 중 (검수 권한 X)
        <Group align="center" justify="space-between" p={6} gap={0}>
          <p>현재 검수가 진행 중인 테마예요!</p>
          <Flex align="flex-start" h={56}>
            <p style={{ color: "var(--main)" }}>7시간 15분 후 심사 시작</p>
          </Flex>
        </Group>
      ) : variant === "vote" ? (
        // 심 사 중
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
            <p>결과 발표까지 21시간 15분</p>
          </Flex>
        </Group>
      ) : (
        // 결 과 발 표
        <Flex align="center" p={6} h={76} gap={0}>
          <p>심사가 종료된 테마예요!</p>
        </Flex>
      )}
    </Stack>
  );
}
