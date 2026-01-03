import Link from "next/link";
import classes from "./footer.module.css";

interface GlobalFooterProps {
  variant: "dressUp" | "tabs";
  activeTab?: number;
  tabs?: string[];
  tabLinks?: string[];
}

export default function GlobalFooter({
  variant,
  activeTab = 0,
  tabs,
  tabLinks,
}: GlobalFooterProps) {
  const renderContent = () => {
    switch (variant) {
      case "dressUp":
        return (
          <div className={classes.DressUpContainer}>
            <Link href="/mini-dressup" className={classes.DressUpLink}>
              미니 꾸미기
            </Link>
          </div>
        );

      case "tabs":
        return (
          <div className={classes.TabContainer}>
            {tabs?.map((text, index) => {
              const isActive = activeTab === index;
              const tabClassName = `${classes.TabItem} ${
                isActive ? classes.ActiveTab : classes.InactiveTab
              }`;

              return isActive ? (
                <div key={index} className={tabClassName}>
                  {text}
                </div>
              ) : (
                <Link
                  key={index}
                  href={tabLinks?.[index] || "#"}
                  className={tabClassName}
                >
                  {text}
                </Link>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return <footer className={classes.FooterContainer}>{renderContent()}</footer>;
}
