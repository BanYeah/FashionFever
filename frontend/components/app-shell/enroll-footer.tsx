import classes from "./enroll-footer.module.css";
import { EnrollButton } from "./enroll-footer-button";

export function EnrollFooter() {
  return (
    <footer className={classes.FooterContainer}>
      <EnrollButton />
    </footer>
  );
}
