"use client";

import classes from "./theme-display.module.css";
import Image from "next/image";
import {
  Flex,
  Group,
  Stack,
  Box,
  UnstyledButton,
  Divider,
} from "@mantine/core";

interface ThemeDisplayProps {
  type: "open" | "pending" | "vote" | "result";
  registered: boolean;
  point?: number;
}

export function ThemeDisplay({ type, registered, point }: ThemeDisplayProps) {
  return (
    <Stack className={classes.Container} gap={0}>
      {/* classes.Container에서 <p> 태그의 color: var(--gray-8a); font-size: 14px로 설정 */}
      <img src="/images/home/gray.svg" width="100%" />
      {type === "open" ? (
        <Group align="center" justify="space-between" p={6} gap={0}>
          <p style={{ color: "var(--black)" }}>
            {registered
              ? "이미 참가한 테마에요!"
              : "아직 참가하지 않은 테마에요!"}
          </p>
          <Stack align="flex-end" justify="space-between" gap={22}>
            <p style={{ color: "var(--main)" }}>23시간 35분 남음</p>
            <UnstyledButton w={20} h={20}>
              <Image
                src="/images/home/register.svg"
                alt=""
                width={20}
                height={20}
              />
            </UnstyledButton>
          </Stack>
        </Group>
      ) : type === "pending" ? (
        <Group align="center" justify="space-between" p={6} gap={0}>
          <p>{registered ? "참가한 테마에요!" : "참가하지 않은 테마에요!"}</p>
          <Flex align="flex-start" h={56}>
            <p style={{ color: "var(--main)" }}>7시간 15분 후 투표 시작</p>
          </Flex>
        </Group>
      ) : type === "vote" ? (
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
                  <p>참가하지 않은 테마에요!</p>
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
            <p>결과 발표까지 21시간 15분</p>
            <ProgressBar point={point} />
          </Stack>
        </Group>
      ) : (
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
                  <p>참가하지 않은 테마에요!</p>
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
            <UnstyledButton
              style={{ position: "absolute", top: "-28px", right: "-6px" }}
              w={61}
              h={61}
            >
              <Image
                src="/images/home/result.svg"
                alt="결과 발표"
                width={61}
                height={61}
              />
            </UnstyledButton>

            <ProgressBar point={point} />
          </Flex>
        </Group>
      )}
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
        src="/images/home/star.svg"
        alt="30%"
        width={25}
        height={26}
      />
      <Image
        className={classes.Star}
        style={{ left: "calc(100% - 68px)" }}
        src="/images/home/star.svg"
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
