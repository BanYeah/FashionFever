"use client";

import classes from "./header.module.css";
import Image from "next/image";
import Link from "next/link";

interface AppShellHeaderProps {
  gift?: boolean;
  subheader?: boolean;
}

export function AppShellHeader({ gift, subheader }: AppShellHeaderProps) {
  const title = "두근 두근 핑크빛 병원";
  const description = "블링블링 러블리한 핑크빛 병원에 어울리는 미니는 누구?";

  return (
    <div className={classes.Container}>
      <div className={classes.MainHeader}>
        <Link href="/home" className={classes.BackButton}>
          <Image
            src="/images/app-shell/goback.svg"
            alt="뒤로가기"
            width={17}
            height={25}
            priority
          />
        </Link>
        <div className={classes.Title}>{title}</div>
        <div className={classes.RightSection}>
          {gift && (
            <Link href="/">
              <Image
                src="/images/app-shell/present.svg"
                alt="선물목록"
                width={30}
                height={30}
              />
            </Link>
          )}
        </div>
      </div>

      {subheader && (
        <div className={classes.Subheader}>
          <p className={classes.Desc}>{description}</p>
        </div>
      )}
    </div>
  );
}
