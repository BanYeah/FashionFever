"use client";

import classes from "./enroll-footer.module.css";
import Image from "next/image";
import { UnstyledButton } from "@mantine/core";

interface EnrollFooterProps {
  disabled?: boolean;
  onClick: () => void;
}

export function EnrollFooter({ disabled, onClick }: EnrollFooterProps) {
  return (
    <div className={classes.FooterContainer}>
      {disabled ? (
        <UnstyledButton className={classes.DisabledBtn} disabled={disabled}>
          <Image
            src="/images/app-shell/disable-enroll.svg"
            alt=""
            width={99}
            height={50}
          />
        </UnstyledButton>
      ) : (
        <UnstyledButton className={classes.PinkBtn} onClick={onClick}>
          <p>참 가 하 기</p>
        </UnstyledButton>
      )}
    </div>
  );
}
