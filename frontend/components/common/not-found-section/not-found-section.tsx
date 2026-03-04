"use client";

import classes from "./not-found-section.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/utils/store/authStore";
import { UnstyledButton } from "@mantine/core";

export function NotFoundSection() {
  const router = useRouter();
  const { user } = useAuthStore.getState();

  return (
    <div className={classes.Container}>
      <Image
        className={classes.Image}
        src="/images/404mini.png"
        alt=""
        width={180}
        height={263}
        loading="eager"
      />
      <p className={classes.Text}>페이지를 찾을 수 없어요!</p>
      <UnstyledButton
        className={classes.Button}
        onClick={() => {
          if (user) router.replace(`/home`);
          else router.replace(`/login`);
        }}
      >
        <div className={classes.ButtonFlex}>
          <div className={classes.ButtonBox}>돌아가기</div>
          <Image
            src="/images/black-tetragon.svg"
            alt=""
            width={50}
            height={40}
          />
        </div>
      </UnstyledButton>
    </div>
  );
}
