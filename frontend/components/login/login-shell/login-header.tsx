import classes from "./login-header.module.css";
import Image from "next/image";
import { Stack } from "@mantine/core";

export function LoginHeader() {
  return (
    <Stack className={classes.Container} gap={0}>
      <div className={classes.Header}>
        <Image
          src="/images/login/headline.svg"
          alt="FASHION FEVER"
          width={187}
          height={59}
        />
      </div>
      <div className={classes.SubHeader}>
        <p>패션을 뽐내는 미니들의 축제</p>
      </div>
    </Stack>
  );
}
