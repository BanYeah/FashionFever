import classes from "./footer.module.css";
import Link from "next/link";

interface AppShellFooterProps {
  variant: "default" | "dressUp" | "tabs";

  // default
  description?: string;

  // dressUp
  themeId?: string;

  // tabs
  activeTab?: number;
  tabs?: string[];
  tabLinks?: string[];
  tabBg?: string;
}

export function AppShellFooter({
  variant,
  description,
  themeId,
  activeTab = 0,
  tabs,
  tabLinks,
  tabBg = "var(--main)",
}: AppShellFooterProps) {
  switch (variant) {
    case "default":
      return (
        <div
          className={classes.FooterContainer}
          style={{ justifyContent: "center", backgroundColor: "var(--main)" }}
        >
          <p style={{ color: "var(--white)", fontSize: "20px" }}>
            {description}
          </p>
        </div>
      );
    case "dressUp":
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
    case "tabs":
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
