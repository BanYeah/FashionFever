"use client";

import classes from "./account-setting.module.css";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { Stack, UnstyledButton, Divider, Input, Group } from "@mantine/core";
import { ModalNoti } from "@/components/common/modal/model-noti";
import { AccountLine } from "./account-line";

interface AccountSettingProps {
  variant: "user" | "judge";
}

export function AccountSetting({ variant }: AccountSettingProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const minicode = searchParams.get("minicode");

  const regex = /^[a-z0-9]{5,7}$/;
  const [searchCode, setSearchCode] = useState("");
  const [addCode, setAddCode] = useState("");

  const [notiMessage, setNotiMessage] = useState<React.ReactNode>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const dataLength = 3;
  const accountData = [
    { miniCode: "ic57m", entryCode: "dlv7*1!u" },
    { miniCode: "ab12c", entryCode: "xk92#p2q" },
    { miniCode: "mini6", entryCode: "entry123" },
  ];

  useEffect(() => {
    setSearchCode("");
  }, [minicode]);

  const handleSearchCode = () => {
    const params = new URLSearchParams(searchParams);
    if (!searchCode) {
      params.delete("minicode");
    } else if (regex.test(searchCode)) {
      params.set("minicode", searchCode);
    } else {
      setNotiMessage(<p>유효하지 않은 형식의 미니코드예요!</p>);
      open();
      return;
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleAddClick = () => {
    if (regex.test(addCode)) {
      if (variant === "user") {
        // 미니코드를 기준으로 유저 생성
        // (1) 201 Created
        // 페이지 새로고침 필요

        // (2) 409 Conflict
        setNotiMessage(<p>이미 존재하는 미니코드예요!</p>);
        open();
      } else {
        // 미니코드를 기준으로 심사위원 임명
        // (1) 201 Created
        // 페이지 새로고침 필요

        // (2) 404 Not Found
        setNotiMessage(<p>존재하지 않는 미니코드예요!</p>);
        open();

        // (3) 409 Conflict
        // setNotiMessage(<p>이미 심사위원으로 임명된 미니예요!</p>);
        // openNoti();
      }
    } else {
      setNotiMessage(<p>유효하지 않은 형식의 미니코드예요!</p>);
      open();
    }
  };

  return (
    <>
      <ModalNoti icon="alert" opened={opened} close={close}>
        {notiMessage}
      </ModalNoti>

      <Stack gap={10} py={12} px={9}>
        <Stack gap={9}>
          <p style={{ paddingLeft: "10px" }}>미니 코드 검색 ({dataLength})</p>
          <Input
            classNames={{ input: classes.SearchInput }}
            variant="unstyled"
            placeholder="미니 코드 입력"
            maxLength={7}
            value={searchCode}
            onChange={(event) => setSearchCode(event.currentTarget.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") handleSearchCode();
            }}
          />
        </Stack>

        <Stack gap={6}>
          <Divider size={1} color="var(--gray-d9)" />
          <Group align="center" w="100%" gap={8}>
            <Input
              classNames={{ input: classes.Input }}
              style={{ flex: 1 }}
              ml={10}
              variant="unstyled"
              placeholder="미니 코드 입력"
              maxLength={7}
              value={addCode}
              onChange={(event) => setAddCode(event.currentTarget.value)}
            />
            <UnstyledButton w={28} h={28} onClick={handleAddClick}>
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
          {/* 검색 결과가 없어요. 추가 필요 */}
          {accountData.map((item, index) => (
            <AccountLine
              key={index}
              variant={variant}
              miniCode={item.miniCode}
              entryCode={item.entryCode}
            />
          ))}
        </Stack>
      </Stack>
    </>
  );
}
