import classes from "./header.module.css";
import Link from "next/link";
import Image from "next/image";
import { UnstyledButton } from "@mantine/core";

export type AppShellVariant = "theme" | "user-setting" | "judge-setting";

interface AppShellHeaderProps {
  variant: AppShellVariant;
  gift?: boolean;
  subHeader?: boolean;
}

export function AppShellHeader({
  gift,
  subHeader,
  variant,
}: AppShellHeaderProps) {
  const themeTitle = "두근 두근 핑크빛 병원";
  const themeDesc = "블링블링 러블리한 핑크빛 병원에 어울리는 미니는 누구?";
  const accountSettingTitle = "계정 관리";
  const userSettingDesc = "패션 피버에 참가할 미니는 누구?";
  const judgeSettingDesc = "패션 피버를 심사할 미니는 누구?";

  const displayTitle =
    variant === "user-setting"
      ? accountSettingTitle
      : variant === "judge-setting"
      ? accountSettingTitle
      : themeTitle;

  const displaySubTitle =
    variant === "user-setting"
      ? userSettingDesc
      : variant === "judge-setting"
      ? judgeSettingDesc
      : themeDesc;

  return (
    <div className={classes.Container}>
      <header className={classes.MainHeader}>
        <Link href="/home" className={classes.BackButton}>
          <Image
            src="/images/app-shell/goback.svg"
            alt="뒤로가기"
            width={17}
            height={25}
            priority
          />
        </Link>

        <div className={classes.Title}>{displayTitle}</div>

        <div className={classes.RightSection}>
          {gift && (
            <UnstyledButton w={30} h={30}>
              <Image
                src="/images/app-shell/present.svg"
                alt="선물목록"
                width={30}
                height={30}
              />
            </UnstyledButton>
          )}
        </div>
      </header>

      {subHeader && (
        <div className={classes.SubHeader}>
          <p className={classes.SubText}>{displaySubTitle}</p>
        </div>
      )}
    </div>
  );
}
