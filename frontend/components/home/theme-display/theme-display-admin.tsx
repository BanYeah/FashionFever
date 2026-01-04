"use client";

import classes from "./theme-display.module.css";
import Image from "next/image";
import Link from "next/link";
import { useDisclosure } from "@mantine/hooks";
import { Flex, Group, Stack, UnstyledButton, Divider } from "@mantine/core";
import { ModalGoBack } from "../../modal/modal-go-back";

interface ThemeDisplayAdminProps {
  variant: "unopen" | "open" | "pending" | "vote" | "result";
}

export function ThemeDisplayAdmin({ variant }: ThemeDisplayAdminProps) {
  return (
    <Stack className={classes.Container} gap={0}>
      {/* classes.Container에서 <p> 태그의 color: var(--gray-8a); font-size: 14px로 설정 */}

      {/* 테마 배너 이미지 */}
      <div className={classes.ImageWrapper}>
        {variant === "pending" ? (
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
          src="/images/home/theme-display/image.png"
          alt=""
          width={372}
          height={130}
          style={{ width: "100%", height: "auto" }}
        />
      </div>

      {/* 참가 상태 */}
      {variant === "unopen" ? (
        // 준 비 중
        <Group align="center" justify="space-between" p={6} gap={0}>
          <p>아직 공개가 되지 않은 테마예요!</p>
          <Stack align="flex-end" justify="space-between" gap={12}>
            <p>23시간 35분 남음</p>
            <Group gap={4}>
              <ThemeDeleteButton />
              <ThemeSettingLink href="/" />
            </Group>
          </Stack>
        </Group>
      ) : variant === "open" ? (
        // 모 집 중
        <Group align="center" justify="space-between" p={6} gap={0}>
          <p style={{ color: "var(--black)" }}>
            아직 미니 꾸미기가 진행 중인 테마예요!
          </p>
          <Stack align="flex-end" justify="space-between" gap={12}>
            <p style={{ color: "var(--main)" }}>23시간 35분 남음</p>
            <ThemeSettingLink href="/" />
          </Stack>
        </Group>
      ) : variant === "pending" ? (
        // 검 수 중
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
            <Group gap={4}>
              <ThemeReviewLink href="/" />
              <ThemeSettingLink href="/" />
            </Group>
          </Stack>
        </Group>
      ) : variant === "vote" ? (
        // 투 표 중
        <Group align="center" justify="space-between" p={6} gap={0}>
          <p>현재 투표가 진행 중인 테마예요!</p>
          <Stack align="flex-end" justify="space-between" gap={12}>
            <p>결과 발표까지 21시간 15분</p>
            <ThemeSettingLink href="/" />
          </Stack>
        </Group>
      ) : (
        // 결 과 발 표
        <Group align="center" justify="space-between" p={6} gap={0}>
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
          <Flex style={{ position: "relative" }} align="flex-end" h={56}>
            <UnstyledButton
              style={{ position: "absolute", top: "-28px", right: "-6px" }}
              w={61}
              h={61}
            >
              <Image
                src="/images/home/theme-display/gift-delivery.svg"
                alt="선물 전달"
                width={61}
                height={61}
              />
            </UnstyledButton>
          </Flex>
        </Group>
      )}
    </Stack>
  );
}

function ThemeDeleteButton() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <ModalGoBack
        title="테마 삭제 안내"
        go="삭제하기"
        back="그만두기"
        opened={opened}
        onGo={() => {}}
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

export function ThemeReviewLink({ href }: { href: string }) {
  return (
    <Link className={classes.ThemeReview} href={href}>
      <p>검수하기</p>
    </Link>
  );
}

function ThemeSettingLink({ href }: { href: string }) {
  return (
    <Link style={{ width: "30px", height: "30px" }} href={href}>
      <Image
        src="/images/home/theme-display/theme-setting.svg"
        alt=""
        width={30}
        height={30}
      />
    </Link>
  );
}
