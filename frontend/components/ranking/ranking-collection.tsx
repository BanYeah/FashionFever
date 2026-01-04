import { Stack } from "@mantine/core";
import { RankingDisplay } from "./ranking-display";

export function RankingCollection() {
  return (
    <Stack gap={12} pt={12} pb={12}>
      <RankingDisplay />
      <RankingDisplay />
      <RankingDisplay />
      <RankingDisplay />
    </Stack>
  );
}
