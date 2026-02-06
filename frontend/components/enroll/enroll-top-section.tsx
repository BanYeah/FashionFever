"use client";

import classes from "./enroll-top-section.module.css";
import Image from "next/image";
import { useDisclosure } from "@mantine/hooks";
import { Group, UnstyledButton } from "@mantine/core";
import { EnrollGuide } from "./enroll-guide";
import { enrollBgColor } from "@/types/enroll-bg-color";

interface EnrollTopSectionProps {
  bgLimit: number | null;
  previews: string[];
  selectedIndex: number;
}

export function EnrollTopSection({
  bgLimit,
  previews,
  selectedIndex,
}: EnrollTopSectionProps) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <EnrollGuide opened={opened} close={close} />

      <div className={classes.EnlargedPhotoWrapper}>
        <AlertBgLimit color={bgLimit} />
        <UnstyledButton className={classes.GuideButton} onClick={open}>
          <Image
            src="/images/enroll/guide-check.svg"
            alt=""
            width={46}
            height={36}
          />
        </UnstyledButton>
        {previews.length > 0 && selectedIndex < previews.length ? (
          <Image
            key={previews[selectedIndex]}
            src={previews[selectedIndex]}
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

function AlertBgLimit({ color }: { color: number | null }) {
  if (color && 0 <= color && color <= 10)
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
                <span style={{ color: `${enrollBgColor[color - 1].color}` }}>
                  {enrollBgColor[color - 1].name}
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
