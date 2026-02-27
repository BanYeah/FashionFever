"use client";

import classes from "./point-footer.module.css";

export function PointFooter({ point = 0 }: { point?: number }) {
  return (
    <div className={classes.FooterContainer}>
      <p style={{ color: "var(--white)", fontSize: "20px" }}>
        공감 포인트 {point ?? 0}
      </p>
    </div>
  );
}
