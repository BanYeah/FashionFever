import classes from "./ranking.module.css";
import { Box } from "@mantine/core";

interface RankingTagProps {
  rank: number;
}

export function RankingTag({ rank }: RankingTagProps) {
  return <Box className={classes.RankingTag}>랭킹 #{rank}</Box>;
}
