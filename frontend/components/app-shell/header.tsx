import classes from "./header.module.css";
import Image from "next/image";
import Link from "next/link";

interface AppShellHeaderProps {
  title: string;
  description: string;
  gift?: boolean;
  subheader?: boolean;
}

export function AppShellHeader({
  title,
  description,
  gift,
  subheader,
}: AppShellHeaderProps) {
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
        <div className={classes.Title}>{title || ""}</div>
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
          <p className={classes.Desc}>{description || ""}</p>
        </div>
      )}
    </div>
  );
}
