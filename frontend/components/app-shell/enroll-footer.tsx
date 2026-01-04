import classes from "./enroll-footer.module.css";

export function EnrollFooter({ children }: { children: React.ReactNode }) {
  return <footer className={classes.FooterContainer}>{children}</footer>;
}
