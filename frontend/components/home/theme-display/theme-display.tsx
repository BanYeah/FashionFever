"use client";

import classes from "./theme-display.module.css";
import Image from "next/image";
import Link from "next/link";
import {
  Flex,
  Group,
  Stack,
  Box,
  UnstyledButton,
  Divider,
} from "@mantine/core";
import { ThemeScheduleData } from "@/types/api/theme";
import { formatDueIn } from "@/utils/format-due-in";

interface ThemeDisplayProps {
  data: ThemeScheduleData;
  registered: boolean;
  point?: number;
}

export function ThemeDisplay({ data, registered, point }: ThemeDisplayProps) {
  const render = () => {
    if (data.status === "ENROLLING")
      return (
        <Group align="center" justify="space-between" p={6} gap={0}>
          <p style={{ color: "var(--black)" }}>
            {registered
              ? "이미 참가한 테마예요!"
              : "아직 참가하지 않은 테마예요!"}
          </p>
          <Stack align="flex-end" justify="space-between" gap={22}>
            <p style={{ color: "var(--main)" }}>
              {formatDueIn(data.review_start_at)} 남음
            </p>
            <Link
              href={`/gift-list?theme_id=${data.theme_id}&before-dress-up`}
              style={{ height: "20px" }}
            >
              <Image
                src="/images/home/theme-display/register.svg"
                alt=""
                width={20}
                height={20}
              />
            </Link>
          </Stack>
        </Group>
      );
    else if (data.status === "REVIEWING")
      return (
        <Group align="center" justify="space-between" p={6} gap={0}>
          <p>{registered ? "참가한 테마예요!" : "참가하지 않은 테마예요!"}</p>
          <Flex align="flex-start" h={56}>
            <p style={{ color: "var(--main)" }}>
              {formatDueIn(data.vote_start_at)} 후 투표 시작
            </p>
          </Flex>
        </Group>
      );
    else if (data.status === "VOTING")
      return (
        <Group align="center" justify="space-between" p={6} gap={0}>
          <Box pt={7} pb={7} w={"50%"}>
            <Stack w={"fit-content"} gap={5}>
              <Group pl={3} pr={3} gap={22}>
                {registered ? (
                  <>
                    <p>현재 최고 랭킹</p>
                    <p>23</p>
                  </>
                ) : (
                  <p>참가하지 않은 테마예요!</p>
                )}
              </Group>
              <Divider size={1.5} color="var(--gray-8a)" />
              <Group pt={3} pl={3} pr={3} gap={36}>
                <p>공감 포인트</p>
                <p>1500</p>
              </Group>
            </Stack>
          </Box>
          <Stack align="flex-end" justify="space-between" w={"50%"} gap={6}>
            <p>결과 발표까지 {formatDueIn(data.result_start_at)}</p>
            <ProgressBar point={point} />
          </Stack>
        </Group>
      );
    else if (data.status === "RESULTING")
      return (
        <Group align="center" justify="space-between" p={6} gap={0}>
          <Box pt={7} pb={7} w={"50%"}>
            <Stack w={"fit-content"} gap={5}>
              <Group pl={3} pr={3} gap={22}>
                {registered ? (
                  <>
                    <p>투표 최고 랭킹</p>
                    <p>23</p>
                  </>
                ) : (
                  <p>참가하지 않은 테마예요!</p>
                )}
              </Group>
              <Divider size={1.5} color="var(--gray-8a)" />
              <Group pt={3} pl={3} pr={3} gap={36}>
                <p>공감 포인트</p>
                <p>1500</p>
              </Group>
            </Stack>
          </Box>
          <Stack align="flex-end" justify="space-between" w={"50%"} gap={6}>
            <p>결과를 집계 중이에요.</p>
            <ProgressBar point={point} />
          </Stack>
        </Group>
      );
    else
      return (
        <Group align="center" justify="space-between" p={6} gap={0}>
          <Box pt={7} pb={7} w={"50%"}>
            <Stack w={"fit-content"} gap={5}>
              <Group pl={3} pr={3} gap={22}>
                {registered ? (
                  <>
                    <p>최종 최고 랭킹</p>
                    <p>20</p>
                  </>
                ) : (
                  <p>참가하지 않은 테마예요!</p>
                )}
              </Group>
              <Divider size={1.5} color="var(--gray-8a)" />
              <Group pt={3} pl={3} pr={3} gap={36}>
                <p>공감 포인트</p>
                <p>1500</p>
              </Group>
            </Stack>
          </Box>
          <Flex
            style={{ position: "relative" }}
            align="flex-end"
            justify="flex-end"
            w={"50%"}
            h={56.5}
          >
            <Link
              style={{
                position: "absolute",
                top: "-28px",
                right: "-6px",
                width: "61px",
                height: "61px",
              }}
              href="/"
            >
              <Image
                src="/images/home/theme-display/result.svg"
                alt="결과 발표"
                width={61}
                height={61}
              />
            </Link>

            <ProgressBar point={point} />
          </Flex>
        </Group>
      );
  };

  return (
    <Stack className={classes.Container} gap={0}>
      {/* classes.Container에서 <p> 태그의 color: var(--gray-8a); font-size: 14px로 설정 */}

      {/* 테마 배너 이미지 */}
      <div className={classes.ImageWrapper}>
        {data.status === "VOTING" ? (
          <Stack
            className={classes.ImageDark}
            align="center"
            justify="center"
            gap={6}
          >
            <p>투 표 중</p>
            <Image
              src="/images/home/theme-display/clock-hour-10.svg"
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

function ProgressBar({ point }: { point?: number }) {
  const validPoint = Math.max(0, point ?? 0);

  return (
    <div className={classes.ProgressWrapper}>
      <Image
        className={classes.Star}
        style={{ left: "calc(30% - 20.4px)" }}
        src="/images/home/theme-display/star.svg"
        alt="30%"
        width={25}
        height={26}
      />
      <Image
        className={classes.Star}
        style={{ left: "calc(100% - 68px)" }}
        src="/images/home/theme-display/star.svg"
        alt="100%"
        width={25}
        height={26}
      />
      <div className={classes.Label} style={{ left: "calc(30% - 20.4px)" }}>
        [30pt]
      </div>
      <div className={classes.Label} style={{ left: "calc(100% - 68px)" }}>
        [100pt]
      </div>
      <div
        className={classes.ProgressBar}
        style={{ width: `calc((100% - 68px) * ${validPoint / 100})` }}
      />
      <div className={classes.ProgressBarBase} />
    </div>
  );
}
