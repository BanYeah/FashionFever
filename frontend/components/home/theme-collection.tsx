"use client";

import { Stack } from "@mantine/core";
import { ThemeDisplay } from "./theme-display/theme-display";

export function ThemeCollection() {
  return (
    <Stack m={10} gap={10}>
      <ThemeDisplay type="open" registered={false} />
      <ThemeDisplay type="open" registered={true} />
      <ThemeDisplay type="pending" registered={false} />
      <ThemeDisplay type="pending" registered={true} />
      <ThemeDisplay type="vote" registered={false} point={10} />
      <ThemeDisplay type="vote" registered={true} point={100} />
      <ThemeDisplay type="result" registered={false} point={30} />
      <ThemeDisplay type="result" registered={true} point={150} />
    </Stack>
  );
}
