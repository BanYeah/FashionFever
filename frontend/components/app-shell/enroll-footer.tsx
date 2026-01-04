"use client";

import classes from "./enroll-footer.module.css";
import Image from "next/image";
import { UnstyledButton } from "@mantine/core";

interface EnrollFooterProps {
  text: string;
  disabled?: boolean;
  onClick: () => void;
}

export function EnrollFooter({ text, disabled, onClick }: EnrollFooterProps) {
  return (
    <div className={classes.FooterContainer}>
      {disabled ? (
        <UnstyledButton
          className={`${classes.Button} ${classes.Disabled}`}
          disabled={disabled}
        >
          <p>{text}</p>
          <Image
            src="/images/app-shell/forbid.svg"
            alt=""
            width={50}
            height={50}
          />
        </UnstyledButton>
      ) : (
        <UnstyledButton className={classes.Button} onClick={onClick}>
          <p>{text}</p>
        </UnstyledButton>
      )}
    </div>
  );
}
