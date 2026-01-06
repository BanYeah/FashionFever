"use client";

import classes from "./search.module.css";
import Image from "next/image";
import { Box, Group, UnstyledButton, Divider } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ModalGoBack } from "@/components/common/modal/modal-go-back";

interface AccountListProps {
  miniCode: string;
  entryCode: string;
}

export function AccountList({ miniCode, entryCode }: AccountListProps) {
  const [resetOpened, { open: openReset, close: closeReset }] =
    useDisclosure(false);

  const handleReset = () => {
    console.log(`${miniCode} 코드 초기화 수행`);
    closeReset();
  };

  const ICON_PATHS = {
    minus: "/images/account-setting/minus.svg",
    reset: "/images/account-setting/reset.svg",
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div className={classes.CodeText}>
          <Box style={{ width: "50px", display: "inline-block" }}>
            {miniCode}
          </Box>
          <span
            style={{
              color: "--gray-b3",
              marginLeft: "14px",
              marginRight: "14px",
            }}
          >
            |
          </span>
          {entryCode}
        </div>

        <Group gap={8}>
          {/* 리셋 버튼 */}
          <UnstyledButton
            onClick={openReset}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image src={ICON_PATHS.reset} alt="Reset" width={28} height={28} />
          </UnstyledButton>

          {/* 마이너스 버튼 */}
          <UnstyledButton
            onClick={openReset}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src={ICON_PATHS.minus}
              alt="Delete"
              width={28}
              height={28}
              style={{ objectFit: "contain" }}
            />
          </UnstyledButton>
        </Group>
      </div>
      <Divider size={1} color="var(--gray-d9)" />
      <ModalGoBack
        title="안내"
        go="계속하기"
        back="그만두기"
        opened={resetOpened}
        onGo={handleReset}
        close={closeReset}
      >
        <div style={{ textAlign: "center", fontSize: "16px" }}>
          정말로 미니 코드
          <span
            style={{
              color: "var(--main)",
            }}
          >
            {" "}
            {miniCode}
          </span>
          의
          <br />
          입장 코드를 초기화하시겠습니까?
        </div>
      </ModalGoBack>
    </>
  );
}
