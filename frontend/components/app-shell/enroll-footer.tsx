"use client";

import classes from "./enroll-footer.module.css";
import { UnstyledButton } from "@mantine/core";

interface EnrollFooterProps {
  onClick: () => void;
}

export function EnrollFooter({ onClick }: EnrollFooterProps) {
  return (
    <footer className={classes.FooterContainer}>
      <UnstyledButton className={classes.PinkBtn} onClick={onClick}>
        <p>참 가 하 기</p>
      </UnstyledButton>
    </footer>
  );
}
