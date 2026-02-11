import classes from "./theme-display.module.css";
import Link from "next/link";

export function ThemeReviewLink({ themeId }: { themeId: string }) {
  return (
    <Link
      className={classes.ThemeReview}
      href={`/theme-review?theme_id=${themeId}`}
    >
      <p>검수하기</p>
    </Link>
  );
}
