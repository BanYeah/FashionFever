"use client";

import classes from "./theme-display.module.css";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Group, Stack, Box, Divider, Loader } from "@mantine/core";
import { ThemeScheduleData } from "@/types/api/theme";
import { formatDueIn } from "@/utils/format-due-in";
import { getSubmission } from "@/utils/api/submission";

export function ThemeDisplay({ data }: { data: ThemeScheduleData }) {
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

      {/* 테마 정보 */}
      <ThemeInfo data={data} />
    </Stack>
  );
}

function ThemeInfo({ data }: { data: ThemeScheduleData }) {
  const [enrolled, setEnrolled] = useState<boolean | null>(null);
  const [ranking, setRanking] = useState<number | null>(null);
  const [point, setPoint] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const result = await getSubmission(data.theme_id);
      if (result.success) {
        if (result.data.content_urls.length === 0) setEnrolled(false);
        else setEnrolled(true);
      }
    })();
  }, []);

  const renderLeft = () => {
    switch (data.status) {
      case "PREPARING":
        return <></>;
      case "ENROLLING":
        if (enrolled === null)
          return <Loader color="var(--black)" size="sm" type="dots" mx={3} />;
        return (
          <p style={{ color: "var(--black)" }}>
            {enrolled
              ? "이미 참가한 테마예요!"
              : "아직 참가하지 않은 테마예요!"}
          </p>
        );
      case "REVIEW_READY":
      case "REVIEWING":
      case "VOTE_READY":
        if (enrolled === null)
          return <Loader color="var(--gray-8a)" size="sm" type="dots" mx={3} />;
        return (
          <p>{enrolled ? "참가한 테마예요!" : "참가하지 않은 테마예요!"}</p>
        );
      case "VOTING":
      case "COMPLETE_READY":
      case "COMPLETE":
        if (enrolled === null || ranking === null)
          return <Loader color="var(--gray-8a)" size="sm" type="dots" mx={3} />;

        const prefix =
          data.status === "VOTING"
            ? "현재"
            : data.status === "COMPLETE_READY"
              ? "투표"
              : "최종"; // "COMPLETE"

        return (
          <Group align="center" justify="space-between" p={6} gap={0}>
            <Box pt={7} pb={7} w={"50%"}>
              <Stack w={"fit-content"} gap={5}>
                <Group pl={3} pr={3} gap={22}>
                  {enrolled ? (
                    <>
                      <p>{prefix} 최고 랭킹</p>
                      <p>{ranking}</p>
                    </>
                  ) : (
                    <p>참가하지 않은 테마예요!</p>
                  )}
                </Group>
                <Divider size={1.5} color="var(--gray-8a)" />
                <Group pt={3} pl={3} pr={3} gap={36}>
                  <p>공감 포인트</p>
                  <p>{point}</p>
                </Group>
              </Stack>
            </Box>
          </Group>
        );
    }
  };
  const renderRight = () => {
    switch (data.status) {
      case "PREPARING":
        return <></>;
      case "ENROLLING":
        return (
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
        );
      case "REVIEW_READY":
      case "REVIEWING":
        return (
          <Stack justify="flex-start" h={"100%"}>
            <p style={{ color: "var(--main)" }}>
              {formatDueIn(data.vote_start_at)} 후 투표 시작
            </p>
          </Stack>
        );
      case "VOTE_READY":
        return (
          <Stack justify="flex-start" h={"100%"}>
            <p style={{ color: "var(--main)" }}>잠시 후 투표 시작</p>
          </Stack>
        );
      case "VOTING":
        return (
          <Stack align="flex-end" justify="space-between" w={"50%"} gap={6}>
            <p>결과 발표까지 {formatDueIn(data.complete_start_at)}</p>
            <ProgressBar point={point} />
          </Stack>
        );
      case "COMPLETE_READY":
        return (
          <Stack align="flex-end" justify="space-between" w={"50%"} gap={6}>
            <p>잠시 후 결과 발표</p>
            <ProgressBar point={point} />
          </Stack>
        );
      case "COMPLETE":
        return (
          <Stack
            style={{ position: "relative" }}
            // align="flex-end"
            justify="flex-end"
            w={"50%"}
            h={"100%"}
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
          </Stack>
        );
    }
  };

  return (
    <Group align="center" justify="space-between" p={6} h={68} gap={0}>
      {renderLeft()}
      {renderRight()}
    </Group>
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
