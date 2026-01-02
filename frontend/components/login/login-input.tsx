"use client";

import classes from "./login-input.module.css";
import Image from "next/image";
import { useState } from "react";
import { Input, UnstyledButton } from "@mantine/core";

interface LoginInputProps {
  disabled?: boolean;
  placeholder: string;
  value?: string;
  rightButton?: boolean;
}

export function LoginInput({
  disabled,
  placeholder,
  value,
  rightButton,
}: LoginInputProps) {
  const [v, setV] = useState(value);

  return (
    <Input
      classNames={{
        wrapper: classes.InputWrapper,
        input: classes.Input,
        section: classes.InputSection,
      }}
      variant="unstyled"
      disabled={disabled}
      placeholder={placeholder}
      value={v}
      onChange={(event) => setV(event.currentTarget.value)}
      maxLength={6}
      rightSection={
        rightButton ? (
          <UnstyledButton className={classes.Button}>
            <Image
              src="/images/login/arrow-right.svg"
              alt=""
              width={24}
              height={24}
            />
          </UnstyledButton>
        ) : null
      }
      rightSectionWidth={rightButton ? 60 : 0}
      rightSectionPointerEvents={rightButton ? "all" : "none"}
    />
  );
}
