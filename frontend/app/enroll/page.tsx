"use client";

import classes from "./classes.module.css";
import Image from "next/image";
import { useDisclosure } from "@mantine/hooks";
import { Group, UnstyledButton } from "@mantine/core";
import { AppShell } from "@/components/app-shell/app-shell";
import { EnrollFooter } from "@/components/app-shell/enroll-footer";
import { ModalGoBack } from "@/components/modal/modal-go-back";
import { EnrollGuide } from "@/components/enroll/enroll-guide";
import { EnrollNoti } from "@/components/enroll/enroll-noti";

export default function EnrollPage() {
  const [guideOpened, { open: openGuide, close: closeGuide }] =
    useDisclosure(false);
  const [enrollOpened, { open: openEnroll, close: closeEnroll }] =
    useDisclosure(false);
  const [notiOpened, { open: openNoti, close: closeNoti }] =
    useDisclosure(false);

  return (
    <>
      <EnrollGuide opened={guideOpened} close={closeGuide} />

      <ModalGoBack
        title="참가 전 안내"
        go="참가하기"
        back="돌아가기"
        opened={enrollOpened}
        onGo={() => {
          closeEnroll();
          openNoti();
        }}
        close={closeEnroll}
      >
        <>
          <p>
            이벤트 참여 전, <br />
            반드시 가이드를 확인해 주세요!
          </p>
          <p>
            가이드에 맞지 않는 사진은 아쉽게도 <br />
            <span>검수 과정에서 제외</span>될 수 있어요.
          </p>
        </>
      </ModalGoBack>

      <EnrollNoti variant="success" opened={notiOpened} close={closeNoti} />

      <AppShell footer={<EnrollFooter onClick={openEnroll} />}>
        <div className={classes.EnlargedPhotoWrapper}>
          <AlertBgLimit color={2} />
          <UnstyledButton className={classes.GuideButton} onClick={openGuide}>
            <Image
              src="/images/enroll/guide-check.svg"
              alt=""
              width={46}
              height={36}
            />
          </UnstyledButton>
          <img src="/images/model.png" width="100%" />
        </div>
      </AppShell>
    </>
  );
}

function AlertBgLimit({ color }: { color: number }) {
  const colorNames = [
    "기본색", // 1
    "분홍색",
    "주황색",
    "초록색",
    "남색",
    "하얀색",
    "보라색",
    "노란색",
    "하늘색",
    "검은색", // 10
  ];
  const colorPalette = [
    "#e0c68b",
    "#ff809d",
    "#f56400",
    "#5aa14d",
    "#1b215b",
    "#cccccc",
    "#a771f4",
    "#ffc478",
    "#7adbf8",
    "#070707",
  ];

  if (0 <= color && color <= 10)
    return (
      <div className={classes.AlertBgLimitWrapper}>
        <Group align="center" gap={8} pl={8} h={"100%"}>
          <Image src="/images/enroll/alert.svg" alt="" width={20} height={20} />
          <div className={classes.AlertBgLimit}>
            {color === 0 ? (
              <p>배경 제한을 공식 카페에서 확인해주세요!</p>
            ) : (
              <p>
                배경색이{" "}
                <span style={{ color: `${colorPalette[color - 1]}` }}>
                  {colorNames[color - 1]}
                </span>
                으로 제한되었어요!
              </p>
            )}
          </div>
        </Group>
      </div>
    );
  else return null;
}
