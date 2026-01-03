import classes from "./enroll-footer.module.css";

export default function EnrollFooter({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <footer className={classes.FooterContainer}>{children}</footer>
  );
}
