"use client";

import classes from "./default-footer.module.css";

export function DefaultFooter() {
  const point: number = 39;

  return (
    <div className={classes.FooterContainer}>
      <p style={{ color: "var(--white)", fontSize: "20px" }}>
        공감 포인트 {point}
      </p>
    </div>
  );
}
