"use client";

import classes from "./home-header.module.css";
import Image from "next/image";
import { UnstyledButton } from "@mantine/core";

export function HelpButton() {
  return (
    <UnstyledButton className={classes.HelpButton}>
      <Image src="/images/home/help.svg" alt="" width={40} height={40} />
    </UnstyledButton>
  );
}
