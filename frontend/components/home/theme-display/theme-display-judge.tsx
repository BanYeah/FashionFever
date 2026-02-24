"use client";

import classes from "./theme-display.module.css";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Group, Stack, Divider } from "@mantine/core";
import { ThemeReviewLink } from "./theme-review-link";
import { ThemeScheduleData } from "@/types/api/theme";
import { getReviewStatus } from "@/utils/api/review";
import { formatDueIn } from "@/utils/format-due-in";

export function ThemeDisplayJudge({ data }: { data: ThemeScheduleData }) {
  const [result, setResult] = useState<any>(undefined);

  useEffect(() => {
    (async () => {
      switch (data.status) {
        case "REVIEWING":
          const res = await getReviewStatus(data.theme_id);
          setResult(res);
          break;
        default:
          setResult(undefined);
      }
    })();
  }, []);

  return (
    <Stack className={classes.Container} gap={0}>
      {/* classes.Container에서 <p> 태그의 color: var(--gray-8a); font-size: 14px로 설정 */}

      {/* 테마 배너 이미지 */}
      <div className={classes.ImageWrapper}>
        {(data.status === "REVIEWING" &&
          result?.success &&
          result.data.can_review) ||
        (data.status === "VOTING" && true) ? (
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

      {/* 테마 정보 */}
      <ThemeInfo data={data} result={result} />
    </Stack>
  );
}

interface ThemeInfoProps {
  data: ThemeScheduleData;
  result: any;
}

function ThemeInfo({ data, result }: ThemeInfoProps) {
  const renderLeft = () => {
    switch (data.status) {
      case "PREPARING":
        return <></>;
      case "INCOMPLETE":
        return <p>참가 인원 부족으로 투표가 무산된 테마예요.</p>;

      case "ENROLLING":
        return (
          <p style={{ color: "var(--black)" }}>
            아직 미니 꾸미기가 진행 중인 테마예요!
          </p>
        );

      case "VOTE_READY":
        return <p>현재 투표 준비가 진행 중인 테마예요!</p>;

      case "COMPLETE_READY":
      case "COMPLETE":
        return <p>심사가 종료된 테마예요!</p>;

      case "REVIEWING":
        return (
          <>
            {result?.success && result.data.can_review ? (
              <Stack pt={7} pb={7} gap={5}>
                <Group pl={3} pr={3} gap={35}>
                  <p>제외된 사진</p>
                  <p>{result.meta.rejected}</p>
                </Group>
                <Divider size={1.5} color="var(--gray-8a)" />
                <Group pt={3} pl={3} pr={3} gap={48}>
                  <p>검수 완료</p>
                  <p>{`${result.meta.reviewed}/${result.meta.total}`}</p>
                </Group>
              </Stack>
            ) : (
              <p>현재 검수가 진행 중인 테마예요!</p>
            )}
          </>
        );
      case "VOTING":
        return (
          <>
            {true ? (
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
          </>
        );
    }
  };
  const renderRight = () => {
    switch (data.status) {
      case "PREPARING":
      case "VOTE_READY":
      case "COMPLETE_READY":
      case "COMPLETE":
      case "INCOMPLETE":
        return <></>;

      case "ENROLLING":
        return (
          <Stack justify="flex-start" h={"100%"}>
            <p style={{ color: "var(--main)" }}>
              {formatDueIn(data.review_start_at)} 남음
            </p>
          </Stack>
        );
      case "REVIEWING":
        return (
          <Stack align="flex-end" justify="space-between" h={"100%"} gap={12}>
            <p style={{ color: "var(--main)" }}>
              {formatDueIn(data.vote_start_at)} 후 투표 시작
            </p>
            {result?.success && result.data.can_review ? (
              <ThemeReviewLink themeId={data.theme_id} />
            ) : (
              <></>
            )}
          </Stack>
        );
      case "VOTING":
        return (
          <Stack justify="flex-start" h={"100%"}>
            <p>결과 발표까지 {formatDueIn(data.complete_start_at)}</p>
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
