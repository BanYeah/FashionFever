"use client";

import classes from "./home-header.module.css";
import Image from "next/image";
import { useNotification } from "@/components/notification/notification";
import { UnstyledButton } from "@mantine/core";
import { logout } from "@/utils/api/auth";

export function LogoutButton() {
  const { notify, notifyServerError } = useNotification();

  return (
    <UnstyledButton
      className={classes.LogoutButton}
      onClick={async () => {
        const result = await logout();
        if (!result.success) notifyServerError();
      }}
    >
      <Image
        src="/images/home/home-shell/logout.svg"
        alt=""
        width={20}
        height={20}
      />
    </UnstyledButton>
  );
}
