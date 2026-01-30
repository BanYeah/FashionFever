"use client";

import "@mantine/core/styles/Popover.css";
import classes from "./account-select.module.css";
import { Dispatch, SetStateAction } from "react";
import { useState, useEffect } from "react";
import { Stack, Box, MultiSelect, Select, CloseButton } from "@mantine/core";
import { Judge } from "@/types/api/judge";
import { fetchJudges } from "@/utils/api/account";

// 검수 계정 관리
interface AccountSelectProps {
  mt?: number;
  label: string;
  value: string | null;
  setValue: Dispatch<SetStateAction<string | null>>;
  handleServerError: () => void;
}

export function AccountSelect({
  mt = 0,
  label,
  value,
  setValue,
  handleServerError,
}: AccountSelectProps) {
  const [data, setData] = useState<string[]>();
  const [searchValue, setSearchValue] = useState("");

  const getData = async () => {
    // 문자열의 시작 부분의 'judge_' 삭제
    const minicode = searchValue.replace(/^judge_/, "");

    const result = await fetchJudges(1, minicode);
    if (result.success) {
      setData([
        ...result.data.map((judge: Judge) => "judge_" + judge.minicode),
      ]);
    } else handleServerError();
  };
  useEffect(() => {
    getData();
  }, [searchValue]);

  return (
    <Stack mt={mt} gap={9}>
      <Box px={10}>
        <p>{label}</p>
      </Box>
      <Select
        classNames={{
          input: classes.SelectInput,
          dropdown: classes.SelectDropdown,
          option: classes.SelectOption,
          empty: classes.SelectEmpty,
        }}
        placeholder="admin_"
        data={data}
        value={value}
        onChange={setValue}
        searchable
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        nothingFoundMessage="검색 결과가 없어요."
        rightSection={
          value ? (
            <CloseButton
              size="sm"
              variant="transparent"
              onClick={(e) => {
                e.stopPropagation();
                setValue(null);
              }}
            />
          ) : null
        }
        rightSectionPointerEvents={"all"}
        limit={5} // 검색 결과 수 제한
      />
    </Stack>
  );
}

// 심사 계정 관리
interface AccountMultiSelectProps {
  mt?: number;
  label: string;
  value: string[];
  setValue: Dispatch<SetStateAction<string[]>>;
  handleServerError: () => void;
}

export function AccountMultiSelect({
  mt = 0,
  label,
  value,
  setValue,
  handleServerError,
}: AccountMultiSelectProps) {
  const [data, setData] = useState<string[]>();
  const [minicode, setMinicode] = useState("");

  const getData = async () => {
    const result = await fetchJudges(1, minicode);
    if (result.success) {
      setData([
        ...result.data.map((judge: Judge) => "judge_" + judge.minicode),
      ]);
    } else handleServerError();
  };
  useEffect(() => {
    getData();
  }, [minicode]);

  return (
    <Stack mt={mt} gap={9}>
      <Box px={10}>
        <p>
          {label} ({value.length})
        </p>
      </Box>
      <MultiSelect
        classNames={{
          input: classes.MultiSelectInput,
          dropdown: classes.SelectDropdown,
          option: classes.SelectOption,
          empty: classes.SelectEmpty,
          pill: classes.MultiSelectPill,
        }}
        data={data}
        value={value}
        onChange={setValue}
        searchable
        searchValue={minicode}
        onSearchChange={setMinicode}
        nothingFoundMessage="검색 결과가 없어요."
        rightSection={null}
        limit={5} // 검색 결과 수 제한
      />
    </Stack>
  );
}
