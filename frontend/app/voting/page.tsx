import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { AppShellHeader } from "@/components/app-shell/header";
import { VoteSection } from "@/components/voting/vote-section";
import { ThemeHeaderData } from "@/types/api/theme";
import { getThemeHeader, getThemeStatus } from "@/utils/api/theme";

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const themeId = Array.isArray(params["theme_id"])
    ? params["theme_id"][0]
    : params["theme_id"];

  if (!themeId) notFound();

  // VOTING(투표 중)이 아니면 '/home'으로 리다이렉트
  const statusResult = await getThemeStatus(themeId);
  if (!statusResult.success) notFound();
  if (statusResult.data.status !== "VOTING") notFound();

  // Header 정보 조회
  const headterResult = await getThemeHeader(themeId);
  if (!headterResult.success) notFound();

  const data: ThemeHeaderData = headterResult.data;

  return (
    <AppShell
      header={
        <AppShellHeader
          title={data.name}
          description={data.desc}
          gift
          subheader
        />
      }
      footer={null}
    >
      <VoteSection themeId={themeId} />
    </AppShell>
  );
}
