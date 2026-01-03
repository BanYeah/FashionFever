"use client";

import classes from "./default-footer.module.css";

export default function DefaultFooter() {
  const description = "공감 포인트 39";

  return (
    <footer className={classes.FooterContainer}>
      <p className={classes.DefaultText}>{description}</p>
    </footer>
  );
}
