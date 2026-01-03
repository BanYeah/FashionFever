"use client";

import classes from "./enroll-footer.module.css";
import { UnstyledButton } from "@mantine/core";

export function EnrollButton() {
  const handleEnrollClick = () => {
    alert("참가하기 버튼이 클릭되었습니다!");
  };

  return (
    <UnstyledButton className={classes.PinkBtn} onClick={handleEnrollClick}>
      <p>참 가 하 기</p>
    </UnstyledButton>
  );
}
