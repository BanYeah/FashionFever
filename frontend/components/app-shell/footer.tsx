import classes from "./footer.module.css";
import Link from "next/link";

interface AppShellFooterProps {
  variant: "dressUp" | "tabs";
  themeId?: string;
  activeTab?: number;
  tabs?: string[];
  tabLinks?: string[];
}

export function AppShellFooter({
  variant,
  themeId,
  activeTab = 0,
  tabs,
  tabLinks,
}: AppShellFooterProps) {
  if (variant === "dressUp") {
    return (
      <div className={classes.FooterContainer}>
        <div className={classes.DressUpContainer}>
          <Link
            href={`/enroll?theme_id=${themeId}`}
            className={classes.DressUpLink}
          >
            미니 꾸미기
          </Link>
        </div>
      </div>
    );
  }
  // tabs
  else {
    return (
      <div className={classes.FooterContainer}>
        <div className={classes.TabContainer}>
          {tabs?.map((text, index) => {
            const isActive = activeTab === index;
            const tabClassName = `${classes.TabItem} ${
              isActive ? classes.ActiveTab : classes.InactiveTab
            }`;

            return isActive ? (
              <div key={`${index}_${text}`} className={tabClassName}>
                {text}
              </div>
            ) : (
              <Link
                key={`${index}_${text}`}
                href={tabLinks?.[index] || "/home"}
                className={tabClassName}
              >
                {text}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }
}
