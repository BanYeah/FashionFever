"use client";

import classes from "./search.module.css";
import Image from "next/image";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import {
  Stack,
  Box,
  UnstyledButton,
  Divider,
  Input,
  Group,
} from "@mantine/core";
import { ModalNoti } from "@/components/common/modal/model-noti";
import { AccountList } from "./account-list";

export function AccountSetting() {
  const [searchValue, setSearchValue] = useState("");
  const [addValue, setAddValue] = useState("");

  const [opened, { open, close }] = useDisclosure(false);

  const accountData = [
    { miniCode: "ic57m", entryCode: "dlv7*1!u" },
    { miniCode: "ab12c", entryCode: "xk92#p2q" },
    { miniCode: "mini6", entryCode: "entry123" },
  ];

  const isValidMinicode = (code: string) => {
    const regex = /^[a-z0-9]{5,12}$/;
    return regex.test(code);
  };

  const handleAddClick = () => {
    if (isValidMinicode(addValue)) {
      setAddValue("");
    } else {
      open();
    }
  };

  return (
    <Box className={classes.Container}>
      <Stack gap={10}>
        {/* 1. 검색 영역 */}
        <Stack gap={9}>
          <p style={{ paddingLeft: "10px" }}>미니 코드 검색 (100)</p>
          <Input
            classNames={{ input: classes.Input }}
            variant="unstyled" // 테두리 없는 모드
            placeholder="미니 코드 입력"
            value={searchValue}
            onChange={(event) => setSearchValue(event.currentTarget.value)}
          />
        </Stack>

        <Divider size={1} color="var(--gray-d9)" />

        {/* 2. 추가 영역 */}
        <Group w="100%" gap={0} align="center">
          <Input
            style={{ flex: 1 }} // 남은 공간 모두 차지하도록 설정
            classNames={{ input: classes.DisplayInput }}
            variant="unstyled"
            placeholder="미니 코드 입력"
            value={addValue}
            onChange={(event) => setAddValue(event.currentTarget.value)}
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

      <ModalNoti icon="alert" opened={opened} close={close}>
        <p>유효하지 않은 형식의 미니코드예요!</p>
      </ModalNoti>
    </Box>
  );
}
