"use client";

import classes from "./theme-display.module.css";
import Image from "next/image";
import Link from "next/link";
import { useDisclosure } from "@mantine/hooks";
import { useNotification } from "@/components/notification/notification";
import { Group, Stack, UnstyledButton, Divider } from "@mantine/core";
import { ModalGoBack } from "../../common/modal/modal-go-back";
import { ThemeReviewLink } from "./theme-review-link";
import { ThemeScheduleData } from "@/types/api/theme";
import { formatDueIn } from "@/utils/format-due-in";
import { deleteThemeSetting } from "@/utils/api/theme";

interface ThemeDisplayAdminProps {
  data: ThemeScheduleData;
  reload: () => void;
}

export function ThemeDisplayAdmin({ data, reload }: ThemeDisplayAdminProps) {
  return (
    <Stack className={classes.Container} gap={0}>
      {/* classes.Container에서 <p> 태그의 color: var(--gray-8a); font-size: 14px로 설정 */}

      {/* 테마 배너 이미지 */}
      <div className={classes.ImageWrapper}>
        {data.status === "REVIEWING" ? (
          <Stack
            className={classes.ImageDark}
            align="center"
            justify="center"
            gap={6}
          >
            <p>검 수 중</p>
            <Image
              src="/images/home/theme-display/clock-hour-4.svg"
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
      <ThemeInfo data={data} reload={reload} />
    </Stack>
  );
}

function ThemeInfo({ data, reload }: ThemeDisplayAdminProps) {
  const renderLeft = () => {
    switch (data.status) {
      case "REVIEW_READY":
        return <p>현재 검수 준비가 진행 중인 테마예요!</p>;
      case "VOTE_READY":
        return <p>현재 투표 준비가 진행 중인 테마예요!</p>;
      case "COMPLETE_READY":
        return <p>현재 결과 집계가 진행 중인 테마예요!</p>;

      case "PREPARING":
        return <p>아직 공개가 되지 않은 테마예요!</p>;
      case "ENROLLING":
        return <p>아직 미니 꾸미기가 진행 중인 테마예요!</p>;
      case "VOTING":
        return <p>현재 투표가 진행 중인 테마예요!</p>;

      case "REVIEWING":
        return (
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
        );
      case "COMPLETE":
        return (
          <Stack pt={7} pb={7} gap={5}>
            <Group pl={3} pr={3} gap={36}>
              <p>전달된 선물</p>
              <p>23</p>
            </Group>
            <Divider size={1.5} color="var(--gray-8a)" />
            <Group pt={3} pl={3} pr={3} gap={48}>
              <p>선물 완료</p>
              <p>100/150</p>
            </Group>
          </Stack>
        );
    }
  };
  const renderRight = () => {
    switch (data.status) {
      case "REVIEW_READY":
      case "VOTE_READY":
      case "COMPLETE_READY":
        return (
          <Stack justify="flex-end" h={"100%"}>
            <ThemeSettingLink themeId={data.theme_id} />
          </Stack>
        );

      case "PREPARING":
        return (
          <Stack align="flex-end" justify="space-between" gap={12}>
            <p>{formatDueIn(data.enroll_start_at)} 남음</p>
            <Group gap={4}>
              <ThemeDeleteButton themeId={data.theme_id} reload={reload} />
              <ThemeSettingLink themeId={data.theme_id} />
            </Group>
          </Stack>
        );
      case "ENROLLING":
        return (
          <Stack align="flex-end" justify="space-between" gap={12}>
            <p style={{ color: "var(--main)" }}>
              {formatDueIn(data.review_start_at)} 남음
            </p>
            <ThemeSettingLink themeId={data.theme_id} />
          </Stack>
        );
      case "REVIEWING":
        return (
          <Stack align="flex-end" justify="space-between" gap={12}>
            <p style={{ color: "var(--main)" }}>
              {formatDueIn(data.vote_start_at)} 후 투표 시작
            </p>
            <Group gap={4}>
              <ThemeReviewLink themeId={data.theme_id} />
              <ThemeSettingLink themeId={data.theme_id} />
            </Group>
          </Stack>
        );
      case "VOTING":
        return (
          <Stack align="flex-end" justify="space-between" gap={12}>
            <p>결과 발표까지 {formatDueIn(data.complete_start_at)}</p>
            <ThemeSettingLink themeId={data.theme_id} />
          </Stack>
        );
      case "COMPLETE":
        return (
          <Stack style={{ position: "relative" }} justify="flex-end" h={"100%"}>
            <Link
              style={{
                position: "absolute",
                top: "-28px",
                right: "-6px",
                width: "61px",
                height: "61px",
              }}
              href={`/gift-delivery?theme_id=${data.theme_id}`}
            >
              <Image
                src="/images/home/theme-display/gift-delivery.svg"
                alt="선물 전달"
                width={61}
                height={61}
              />
            </Link>

            <ThemeSettingLink themeId={data.theme_id} blur />
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

interface ThemeDeleteButtonProps {
  themeId: string;
  reload: () => void;
}

function ThemeDeleteButton({ themeId, reload }: ThemeDeleteButtonProps) {
  const { notify, notifyServerError } = useNotification();
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <ModalGoBack
        title="테마 삭제 안내"
        go="삭제하기"
        back="그만두기"
        opened={opened}
        onGo={async () => {
          const result = await deleteThemeSetting(themeId);
          if (result.success) {
            reload();
            close();
            return;
          }

          close();
          switch (result.status) {
            case 404:
              notify(<p>존재하지 않는 테마예요!</p>);
              return;
            default:
              notifyServerError();
          }
        }}
        close={close}
      >
        <p>
          테마 삭제는 <span>되돌릴 수 없습니다.</span> <br />
          정말로 테마를 삭제하시겠습니까?
        </p>
      </ModalGoBack>

      <UnstyledButton w={30} h={30} onClick={open}>
        <Image
          src="/images/home/theme-display/theme-delete.svg"
          alt=""
          width={30}
          height={30}
        />
      </UnstyledButton>
    </>
  );
}

function ThemeSettingLink({
  themeId,
  blur,
}: {
  themeId: string;
  blur?: boolean;
}) {
  return (
    <Link
      style={{ height: "30px" }}
      href={`/theme-setting?theme_id=${themeId}`}
    >
      <Image
        src={
          blur
            ? "/images/home/theme-display/theme-setting-blur.svg"
            : "/images/home/theme-display/theme-setting.svg"
        }
        alt=""
        width={30}
        height={30}
      />
    </Link>
  );
}
