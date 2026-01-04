import classes from "./header.module.css";
import Link from "next/link";
import Image from "next/image";
import { UnstyledButton } from "@mantine/core";

interface AppShellHeaderProps {
  gift?: boolean;
}

export function AppShellHeader({ gift }: AppShellHeaderProps) {
  const title: string = "두근 두근 핑크빛 병원";
  const subTitle: string =
    "블링블링 러블리한 핑크빛 병원에 어울리는 미니는 누구?";
  return (
    <div className={classes.Container}>
      <header className={classes.MainHeader}>
        {/* 뒤로가기 버튼 영역 */}
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

        {/* 우측 선물 버튼 영역 */}
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

      {subTitle && (
        <div className={classes.SubHeader}>
          <p className={classes.SubText}>{subTitle}</p>
        </div>
      )}
    </div>
  );
}
