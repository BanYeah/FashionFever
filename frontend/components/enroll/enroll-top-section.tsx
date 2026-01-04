"use client";

import classes from "./enroll-top-section.module.css";
import Image from "next/image";
import { useDisclosure } from "@mantine/hooks";
import { Group, UnstyledButton } from "@mantine/core";
import { EnrollGuide } from "./enroll-guide";

interface EnrollTopSectionProps {
  index: number;
  previews: string[];
}

export function EnrollTopSection({ index, previews }: EnrollTopSectionProps) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <EnrollGuide opened={opened} close={close} />

      <div className={classes.EnlargedPhotoWrapper}>
        <AlertBgLimit color={2} />
        <UnstyledButton className={classes.GuideButton} onClick={open}>
          <Image
            src="/images/enroll/guide-check.svg"
            alt=""
            width={46}
            height={36}
          />
        </UnstyledButton>
        {previews.length > 0 && index < previews.length ? (
          <Image
            key={previews[index]}
            src={previews[index]}
            alt=""
            width={390}
            height={312}
            style={{ width: "100%", height: "auto" }}
          />
        ) : (
          <div className={classes.EmptyImage}></div>
        )}
      </div>
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
