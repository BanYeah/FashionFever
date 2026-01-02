import classes from "./home-header.module.css";
import Image from "next/image";
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
          src="/images/home/fashionminini.png"
          alt=""
          width={98}
          height={113}
        />
        <HelpButton />
        <LogoutButton />
        <VoteButton />

        <Stack gap={0}>
          <div className={classes.TopSection}>
            <div className={classes.TopCenter}>
              <Image
                src="/images/home/fashion-fever.svg"
                alt=""
                width={169}
                height={24}
              />
            </div>
          </div>
          <div className={classes.BottomSection}>
            <div className={classes.BottomCenter}>패션 피버</div>
          </div>
        </Stack>
      </div>
    </div>
  );
}
