"use client";

import { Stack } from "@mantine/core";
import { ThemeDisplay } from "./theme-display/theme-display";
import { ThemeDisplayJudge } from "./theme-display/theme-display-judge";
import { ThemeDisplayAdmin } from "./theme-display/theme-display-admin";

export function ThemeCollection() {
  const type = "user" as "user" | "judge" | "admin";

  return (
    <Stack p={10} gap={10}>
      {type === "user" ? (
        <>
          {/* API 연결할 때는 variant, registerd, point 등의 Props 제거하고 데이터만 전달 */}
          <ThemeDisplay variant="open" registered={false} />
          <ThemeDisplay variant="open" registered={true} />
          <ThemeDisplay variant="pending" registered={false} />
          <ThemeDisplay variant="pending" registered={true} />
          <ThemeDisplay variant="vote" registered={false} point={10} />
          <ThemeDisplay variant="vote" registered={true} point={100} />
          <ThemeDisplay variant="result" registered={false} point={30} />
          <ThemeDisplay variant="result" registered={true} point={150} />
        </>
      ) : type == "judge" ? (
        <>
          <ThemeDisplayJudge variant="open" />
          <ThemeDisplayJudge variant="pending" registered={false} />
          <ThemeDisplayJudge variant="pending" registered={true} />
          <ThemeDisplayJudge variant="vote" registered={false} />
          <ThemeDisplayJudge variant="vote" registered={true} />
          <ThemeDisplayJudge variant="result" />
        </>
      ) : (
        <>
          <ThemeDisplayAdmin variant="unopen" />
          <ThemeDisplayAdmin variant="open" />
          <ThemeDisplayAdmin variant="pending" />
          <ThemeDisplayAdmin variant="vote" />
          <ThemeDisplayAdmin variant="result" />
        </>
      )}
    </Stack>
  );
}
