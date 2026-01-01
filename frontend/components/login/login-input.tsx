"use client";

import classes from "./login-input.module.css";
import Image from "next/image";
import { useState } from "react";
import { Input } from "@mantine/core";

export function LoginInput() {
  const [value, setValue] = useState("");

  return (
    <Input
      classNames={{
        wrapper: classes.InputWrapper,
        input: classes.Input,
        section: classes.InputSection,
      }}
      variant="unstyled"
      placeholder="미니 코드 입력"
      value={value}
      onChange={(event) => setValue(event.currentTarget.value)}
      maxLength={6}
      rightSection={
        <button className={classes.Button}>
          <Image
            src="/images/login/arrow-right.svg"
            alt=""
            width={24}
            height={24}
          />
        </button>
      }
      rightSectionWidth={60}
      rightSectionPointerEvents="all"
    />
  );
}
