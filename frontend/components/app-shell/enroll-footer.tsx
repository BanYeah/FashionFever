"use client";

import classes from "./enroll-footer.module.css";
import Image from "next/image";
import { UnstyledButton, Loader } from "@mantine/core";

interface EnrollFooterProps {
  text: string;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function EnrollFooter({
  text,
  loading,
  disabled,
  onClick,
}: EnrollFooterProps) {
  if (loading)
    return (
      <div className={classes.FooterContainer}>
        <div className={classes.Button}>
          <Loader color="var(--white)" type="dots" />
        </div>
      </div>
    );

  if (disabled)
    return (
      <div className={classes.FooterContainer}>
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
      </div>
    );
  else
    return (
      <div className={classes.FooterContainer}>
        <UnstyledButton className={classes.Button} onClick={onClick}>
          <p>{text}</p>
        </UnstyledButton>
      </div>
    );
}
