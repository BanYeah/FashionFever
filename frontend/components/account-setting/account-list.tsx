"use client";

import Image from "next/image";
import { useDisclosure } from "@mantine/hooks";
import { Group, UnstyledButton, Divider } from "@mantine/core";
import { ModalGoBack } from "@/components/common/modal/modal-go-back";
import { useState } from "react";

interface AccountListProps {
  miniCode: string;
  entryCode: string;
}

export function AccountList({ miniCode, entryCode }: AccountListProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [state, setState] = useState<"reset" | "delete">("reset");

  return (
    <>
      <ModalGoBack
        title="안내"
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
            {state === "reset" ? "입장 코드를 초기화" : "계정을 삭제"}
          </span>
          하시겠습니까?
        </p>
      </ModalGoBack>

      <Group align="center" justify="space-between">
        <Group ml={10} gap={14}>
          <p style={{ width: "50px" }}>{miniCode}</p>
          <span
            style={{
              color: "var(--gray-b3)",
            }}
          >
            |
          </span>
          <p>{entryCode}</p>
        </Group>

        <Group gap={8}>
          {/* 리셋 버튼 */}
          <UnstyledButton
            onClick={() => {
              setState("reset");
              open();
            }}
            w={28}
            h={28}
          >
            <Image
              src="/images/account-setting/reset.svg"
              alt="Reset"
              width={28}
              height={28}
            />
          </UnstyledButton>

          {/* 마이너스 버튼 */}
          <UnstyledButton
            onClick={() => {
              setState("delete");
              open();
            }}
            w={28}
            h={28}
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
