"use client";

import classes from "./home-header.module.css";
import Image from "next/image";
import { UnstyledButton } from "@mantine/core";

export function LogoutButton() {
  return (
    <UnstyledButton className={classes.LogoutButton}>
      <Image
        src="/images/home/home-shell/logout.svg"
        alt=""
        width={20}
        height={20}
      />
    </UnstyledButton>
  );
}
