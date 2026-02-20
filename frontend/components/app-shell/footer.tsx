import classes from "./footer.module.css";
import Link from "next/link";

interface AppShellFooterProps {
  variant: "dressUp" | "tabs";
  themeId?: string;
  activeTab?: number;
  tabs?: string[];
  tabLinks?: string[];
  tabBg?: string;
}

export function AppShellFooter({
  variant,
  themeId,
  activeTab = 0,
  tabs,
  tabLinks,
  tabBg = "var(--main)",
}: AppShellFooterProps) {
  if (variant === "dressUp") {
    return (
      <div
        className={classes.FooterContainer}
        style={{ backgroundColor: "var(--main)" }}
      >
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
      <div
        className={classes.FooterContainer}
        style={{ backgroundColor: tabBg }}
      >
        <div className={classes.TabContainer}>
          {tabs?.map((text, index) => {
            const isActive = activeTab === index;
            const style = {
              backgroundColor: isActive ? "var(--white)" : tabBg,
              color: isActive ? tabBg : "var(--white)",
            };

            return isActive ? (
              <div
                key={`${index}_${text}`}
                className={classes.TabItem}
                style={style}
              >
                {text}
              </div>
            ) : (
              <Link
                key={`${index}_${text}`}
                href={tabLinks?.[index] || "/home"}
                className={classes.TabItem}
                style={style}
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
