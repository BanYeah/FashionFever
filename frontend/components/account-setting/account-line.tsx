"use client";

import classes from "./account-setting.module.css";
import Image from "next/image";
import { useDisclosure } from "@mantine/hooks";
import { Group, UnstyledButton, Divider } from "@mantine/core";
import { ModalGoBack } from "@/components/common/modal/modal-go-back";
import { useState } from "react";

interface AccountLineProps {
  variant: "user" | "judge";
  miniCode: string;
  entryCode: string;
}

export function AccountLine({
  variant,
  miniCode,
  entryCode,
}: AccountLineProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [action, setAction] = useState<"reset" | "delete">("reset");

  return (
    <>
      <ModalGoBack
        title="계정 관리 안내"
        go="계속하기"
        back="그만두기"
        opened={opened}
        onGo={() => {}}
        close={close}
      >
        <p>
          정말로 미니 코드 <span>{miniCode}</span>
          의
          <br />
          <span>
            {action === "reset"
              ? "입장 코드를 초기화"
              : variant === "user"
              ? "계정을 삭제"
              : "심사위원 임명을 취소"}
          </span>
          하시겠습니까?
        </p>
      </ModalGoBack>

      <Group className={classes.AccountLine} align="center" gap={8}>
        <Group className={classes.AccountText} ml={10} gap={14}>
          <p style={{ minWidth: "76px" }}>{miniCode}</p>
          {variant === "user" && (
            <>
              <span>|</span>
              <p>{entryCode}</p>
            </>
          )}
        </Group>

        <Group gap={8}>
          <div className={classes.AccountDate}>26.01.09</div>
          {variant === "user" && (
            <UnstyledButton
              w={28}
              h={28}
              onClick={() => {
                setAction("reset");
                open();
              }}
            >
              <Image
                src="/images/account-setting/reset.svg"
                alt="Reset"
                width={28}
                height={28}
              />
            </UnstyledButton>
          )}
          <UnstyledButton
            w={28}
            h={28}
            onClick={() => {
              setAction("delete");
              open();
            }}
          >
            <Image
              src="/images/account-setting/minus.svg"
              alt="Delete"
              width={28}
              height={28}
            />
          </UnstyledButton>
        </Group>
      </Group>
      <Divider size={1} color="var(--gray-d9)" />
    </>
  );
}
