import classes from "./theme-input.module.css";
import { Dispatch, SetStateAction } from "react";
import { Stack, Box, Input } from "@mantine/core";

interface ThemeInputProps {
  mt?: number;
  label: string;
  placeholder: string;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  disabled?: boolean;
}

export function ThemeInput({
  mt = 0,
  label,
  placeholder,
  value,
  setValue,
  disabled,
}: ThemeInputProps) {
  return (
    <Stack mt={mt} gap={9}>
      <Box px={10}>
        <p>{label}</p>
      </Box>
      <Input
        classNames={{ input: classes.Input }}
        variant="unstyled"
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        disabled={disabled}
      />
    </Stack>
  );
}
