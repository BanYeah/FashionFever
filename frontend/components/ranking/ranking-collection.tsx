import { Stack } from "@mantine/core";
import { RankingDisplay } from "./ranking-display";

export function RankingCollection() {
  return (
    <Stack gap={12} m={12}>
      <RankingDisplay />
      <RankingDisplay />
      <RankingDisplay />
      <RankingDisplay />
    </Stack>
  );
}
