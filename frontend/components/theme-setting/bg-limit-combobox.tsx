"use client";

import classes from "./bg-limit-combobox.module.css";
import { Dispatch, SetStateAction } from "react";
import { InputBase, Combobox, ComboboxStore, Stack, Box } from "@mantine/core";

interface BgLimitComboboxProps {
  mt?: number;
  combobox: ComboboxStore;
  enrollBgLimit: { name: string; color: string }[];
  bgLimit: string | null;
  setBgLimit: Dispatch<SetStateAction<string | null>>;
}

export function BgLimitCombobox({
  mt = 0,
  combobox,
  enrollBgLimit,
  bgLimit,
  setBgLimit,
}: BgLimitComboboxProps) {
  const enrollBgColorbyName = enrollBgLimit.reduce(
    (acc, item) => {
      acc[item.name] = item.color;
      return acc;
    },
    {} as Record<string, string>,
  );
  const options = enrollBgLimit.map((item) => (
    <Combobox.Option
      className={classes.ComboboxOption}
      value={item.name}
      key={item.name}
      c={item.color}
    >
      {item.name}
    </Combobox.Option>
  ));

  return (
    <Stack mt={mt} gap={9}>
      <Box px={10}>
        <p>배경색 제한</p>
      </Box>
      <Combobox
        store={combobox}
        onOptionSubmit={(val) => {
          setBgLimit(val);
          combobox.closeDropdown();
        }}
      >
        <Combobox.Target>
          <InputBase
            classNames={{
              input: classes.InputBaseInput,
            }}
            styles={{
              input: {
                color: bgLimit ? enrollBgColorbyName[bgLimit] : "var(--black)",
              },
            }}
            component="button"
            type="button"
            pointer
            onClick={() => combobox.toggleDropdown()}
          >
            {bgLimit}
          </InputBase>
        </Combobox.Target>

        <Combobox.Dropdown className={classes.ComboboxDropdown}>
          <Combobox.Options>{options}</Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </Stack>
  );
}
