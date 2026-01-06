"use client";

import classes from "./account-setting.module.css";
import Image from "next/image";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { Stack, UnstyledButton, Divider, Input, Group } from "@mantine/core";
import { ModalNoti } from "@/components/common/modal/model-noti";
import { AccountList } from "./account-list";

export function AccountSetting() {
  const [searchCode, setSearchCode] = useState("");
  const [addCode, setAddCode] = useState("");

  const [opened, { open, close }] = useDisclosure(false);

  const accountData = [
    { miniCode: "ic57m", entryCode: "dlv7*1!u" },
    { miniCode: "ab12c", entryCode: "xk92#p2q" },
    { miniCode: "mini6", entryCode: "entry123" },
  ];

  const isValidMinicode = (code: string) => {
    const regex = /^[a-z0-9]{5,6}$/;
    return regex.test(code);
  };

  const handleAddClick = () => {
    // 이미 있는 미니 코드인지 여부 확인 필요!
    if (isValidMinicode(addCode)) {
      setAddCode("");
    } else {
      open();
    }
  };

  return (
    <>
      <ModalNoti icon="alert" opened={opened} close={close}>
        <p>유효하지 않은 형식의 미니코드예요!</p>
      </ModalNoti>

      <Stack gap={10} py={12} px={9}>
        {/* 미니 코드 검색 */}
        <Stack gap={9}>
          <p style={{ paddingLeft: "10px" }}>미니 코드 검색 (100)</p>
          <Input
            classNames={{ input: classes.SearchInput }}
            variant="unstyled"
            placeholder="미니 코드 입력"
            value={searchCode}
            onChange={(event) => setSearchCode(event.currentTarget.value)}
            maxLength={6}
          />
        </Stack>

        <Stack gap={6}>
          <Divider size={1} color="var(--gray-d9)" />
          {/* 미니 코드 추가 */}
          <Group align="center" w="100%" gap={8}>
            <Input
              classNames={{ input: classes.Input }}
              style={{ flex: 1 }}
              ml={10}
              variant="unstyled"
              placeholder="미니 코드 입력"
              value={addCode}
              onChange={(event) => setAddCode(event.currentTarget.value)}
              maxLength={6}
            />
            <UnstyledButton onClick={handleAddClick} w={28} h={28}>
              <Image
                src="/images/account-setting/plus.svg"
                alt="Add"
                width={28}
                height={28}
              />
            </UnstyledButton>
          </Group>
          <Divider size={1} color="var(--gray-d9)" />
        </Stack>

        <Stack gap={10}>
          {accountData.map((item, index) => (
            <AccountList
              key={index}
              miniCode={item.miniCode}
              entryCode={item.entryCode}
            />
          ))}
        </Stack>
      </Stack>
    </>
  );
}
