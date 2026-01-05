"use client";

import "@mantine/core/styles/Popover.css";
import classes from "./account-select.module.css";
import { Dispatch, SetStateAction } from "react";
import { Stack, Box, MultiSelect, Select } from "@mantine/core";

interface AccountSelectProps {
  mt?: number;
  label: string;
  value: string | null;
  setValue: Dispatch<SetStateAction<string | null>>;
}

export function AccountSelect({
  mt = 0,
  label,
  value,
  setValue,
}: AccountSelectProps) {
  const data = ["admin", "React", "Angular", "Vue", "Svelte"];

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
        }}
        data={data}
        value={value}
        onChange={setValue}
        rightSection={null}
        placeholder="admin"
        searchable
        nothingFoundMessage="검색 결과가 없어요"
        limit={3} // 검색 결과 수 제한
      />
    </Stack>
  );
}

interface AccountMultiSelectProps {
  mt?: number;
  label: string;
  value: string[];
  setValue: Dispatch<SetStateAction<string[]>>;
}

export function AccountMultiSelect({
  mt = 0,
  label,
  value,
  setValue,
}: AccountMultiSelectProps) {
  const data = ["React", "Angular", "Vue", "Svelte"];

  return (
    <Stack mt={mt} gap={9}>
      <Box px={10}>
        <p>{label}</p>
      </Box>
      <MultiSelect
        classNames={{
          input: classes.MultiSelectInput,
          dropdown: classes.SelectDropdown,
          option: classes.SelectOption,
          pill: classes.MultiSelectPill,
        }}
        data={data}
        value={value}
        onChange={setValue}
        rightSection={null}
        searchable
        nothingFoundMessage="검색 결과가 없어요"
        limit={3} // 검색 결과 수 제한
      />
    </Stack>
  );
}
