import classes from "./home-header.module.css";
import Image from "next/image";
import Link from "next/link";
import { Stack } from "@mantine/core";
import { HelpButton } from "./help-button";
import { LogoutButton } from "./logout-button";
import { VoteButton } from "./vote-button";

export function HomeHeader() {
  return (
    <div className={classes.Container}>
      <div style={{ position: "relative" }}>
        <Image
          style={{ position: "absolute", left: "2px" }}
          src="/images/home/home-shell/fashionminini.png"
          alt=""
          width={98}
          height={113}
          priority
        />
        <HelpButton />
        <LogoutButton />
        <VoteButton />

        <Stack gap={0}>
          <div className={classes.TopSection}>
            <div className={classes.TopCenter}>
              <Image
                src="/images/home/home-shell/fashion-fever.svg"
                alt=""
                width={169}
                height={24}
              />
            </div>
          </div>
          <div className={classes.BottomSection}>
            <div className={classes.BottomCenter}>
              <Link href="/home" style={{ transform: "translateY(1px)" }}>
                패션 피버
              </Link>
            </div>
          </div>
        </Stack>
      </div>
    </div>
  );
}
