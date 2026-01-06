"use client";

import Image from "next/image";
import { useDisclosure } from "@mantine/hooks";
import { Box, Group, UnstyledButton, Divider } from "@mantine/core";
import { ModalGoBack } from "@/components/common/modal/modal-go-back";

interface AccountListProps {
  miniCode: string;
  entryCode: string;
}

export function AccountList({ miniCode, entryCode }: AccountListProps) {
  const [opened, { open, close }] = useDisclosure(false);

  const handleReset = () => {
    console.log(`${miniCode} 코드 초기화 수행`);
    close();
  };

  return (
    <>
      <Group align="center" justify="space-between">
        <Group ml={10}>
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
          <UnstyledButton onClick={open} w={28} h={28}>
            <Image
              src="/images/account-setting/reset.svg"
              alt="Reset"
              width={28}
              height={28}
            />
          </UnstyledButton>

          {/* 마이너스 버튼 */}
          <UnstyledButton onClick={open} w={28} h={28}>
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

      <ModalGoBack
        title="안내"
        go="계속하기"
        back="그만두기"
        opened={opened}
        onGo={() => {}}
        close={close}
      >
        <p>
          정말로 미니 코드{" "}
          <span
            style={{
              color: "var(--main)",
            }}
          >
            {miniCode}
          </span>
          의
          <br />
          입장 코드를 초기화하시겠습니까?
        </p>
      </ModalGoBack>
    </>
  );
}
