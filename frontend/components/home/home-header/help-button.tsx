"use client";

import classes from "./home-header.module.css";
import Image from "next/image";
import { useDisclosure } from "@mantine/hooks";
import { Stack, UnstyledButton } from "@mantine/core";
import { ModalNoti } from "@/components/common/modal/model-noti";

export function HelpButton() {
  const type = "user" as "user" | "judge" | "admin";
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      {type === "user" || type === "judge" ? (
        <>
          <ModalNoti icon="alert" opened={opened} close={close}>
            <>
              <Stack gap={30}>
                <div>
                  <p style={{ fontSize: "14px" }}>
                    다양한 테마에 맞게 미니를 개성 있게 꾸며주세요~♥
                  </p>
                  <p style={{ fontSize: "14px" }}>
                    초 레어 아이템이 선물로 주어지는 특별한 축제!
                  </p>
                  <p style={{ fontSize: "14px" }}>
                    예쁘고 멋진 미니들을 투표하고 공감 점수도 받아가세요 ^-^
                  </p>
                  <p style={{ color: "var(--gray-8a)", fontSize: "14px" }}>
                    *공감 점수는 공감 포인트 100을 기준으로 최대치(만점)으로
                    산정하니, 이 점 미리 확인해 주세요!
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: "14px" }}>
                    패션 피버 참여 취소를 원하신다면,
                  </p>
                  <p style={{ fontSize: "14px" }}>
                    패션 피버 운영 계정(미니 코드: oooooo)으로 1:1 메세지를
                    주시거나 공식 카페 내 게시글에 댓글을 남겨주세요. 확인 후
                    빠르게 처리해 드리겠습니다.
                  </p>
                </div>
              </Stack>
            </>
          </ModalNoti>

          <UnstyledButton className={classes.HelpButton} onClick={open}>
            <Image
              src="/images/home/home-shell/help.svg"
              alt=""
              width={40}
              height={40}
            />
          </UnstyledButton>
        </>
      ) : (
        <UnstyledButton className={classes.HelpButton}>
          <Image
            src="/images/home/home-shell/theme-add.svg"
            alt=""
            width={40}
            height={40}
          />
        </UnstyledButton>
      )}
    </>
  );
}
