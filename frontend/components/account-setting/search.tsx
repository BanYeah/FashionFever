"use client";

import classes from "./search.module.css";
import Image from "next/image";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { ModalNoti } from "@/components/common/modal/model-noti";
import { AccountList } from "./account-list";

import { Stack, Box, UnstyledButton, Divider } from "@mantine/core";

interface SearchProp {
  type: "user" | "judge";
}

export function Search({ type }: SearchProp) {
  const [searchValue, setSearchValue] = useState("");
  const [addValue, setAddValue] = useState("");
  const [notiOpened, { open: openNoti, close: closeNoti }] =
    useDisclosure(false);

  const accountData = [
    { miniCode: "ic57m", entryCode: "dlv7*1!u" },
    { miniCode: "ab12c", entryCode: "xk92#p2q" },
    { miniCode: "mini6", entryCode: "entry123" },
  ];

  const ICON_PATHS = {
    plus: "/images/account-setting/plus.svg",
  };

  const isValidMinicode = (code: string) => {
    if (type === "judge") {
      const regex = /^[a-z0-9_]{5,12}$/;
      return regex.test(code);
    } else {
      const regex = /^[a-z0-9]{5,12}$/;
      return regex.test(code);
    }
  };

  const handleAddClick = () => {
    if (isValidMinicode(addValue)) {
      console.log("유효한 미니코드입니다:", addValue);
      setAddValue("");
    } else {
      openNoti();
    }
  };

  return (
    <Box className={classes.Container}>
      <Stack gap={10}>
        {/* 1. 검색 영역 */}
        <Box>
          <p className={classes.Label}>미니 코드 검색 (100)</p>
          <input
            className={classes.Input}
            placeholder="미니 코드 입력"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </Box>

        <Divider size={1} color="var(--gray-d9)" />

        {/* 2. 추가 영역 */}
        <Box style={{ position: "relative", width: "100%", display: "flex" }}>
          <input
            className={classes.DisplayInput}
            placeholder="미니 코드 입력"
            value={addValue}
            onChange={(e) => setAddValue(e.target.value)}
          />
          <UnstyledButton
            onClick={handleAddClick}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image src={ICON_PATHS.plus} alt="Add" width={28} height={28} />
          </UnstyledButton>
        </Box>

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

      <ModalNoti icon="alert" opened={notiOpened} close={closeNoti}>
        <div style={{ textAlign: "center", fontSize: "16px" }}>
          유효하지 않은 형식의 미니코드예요!
        </div>
      </ModalNoti>
    </Box>
  );
}
