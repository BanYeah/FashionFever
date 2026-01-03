'use client';

import { UnstyledButton } from '@mantine/core';
import classes from './enroll-footer.module.css';

interface EnrollFooterProps {
  href?: string;
  onClick?: () => void;
}

export default function EnrollFooter({ href = '/entry', onClick }: EnrollFooterProps) {
  return (
    <footer className={classes.footerContainer}>
      <div className={classes.entryContainer}>
            <UnstyledButton className={classes.pinkBtn} onClick={() => onClick?.()}>
              참가하기
            </UnstyledButton>
          </div>
    </footer>
  );
}