"use client";

import classes from "./default-footer.module.css";

export default function DefaultFooter() {
  const point: number = 39;

  return (
    <div className={classes.FooterContainer}>
      <p className={classes.DefaultText}>공감 포인트 {point}</p>
    </div>
  );
}
