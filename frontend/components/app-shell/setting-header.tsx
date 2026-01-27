import classes from "./header.module.css";
import Image from "next/image";
import Link from "next/link";

interface SettingHeaderProps {
  variant: "user" | "judge";
}

export function SettingHeader({ variant }: SettingHeaderProps) {
  const description =
    variant === "user"
      ? "패션 피버에 참가할 미니는 누구?"
      : "패션 피버를 심사할 미니는 누구?";

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

        <div className={classes.Title}>계정 관리</div>
        <div className={classes.RightSection}></div>
      </div>

      <div className={classes.Subheader}>
        <p className={classes.Desc}>{description}</p>
      </div>
    </div>
  );
}
