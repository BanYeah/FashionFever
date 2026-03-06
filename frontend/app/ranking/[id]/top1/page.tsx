import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { AppShellHeader } from "@/components/app-shell/header";
import { ThemeHeaderData } from "@/types/api/theme";
import { getThemeHeader } from "@/utils/api/theme";
import { RankingStack } from "@/components/ranking/ranking-stack";

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

  // Header 정보 조회
  const result = await getThemeHeader(themeId);
  if (!result.success) notFound();

  const data: ThemeHeaderData = result.data;

  return (
    <AppShell
      header={
        <AppShellHeader
          themeId={data.theme_id}
          title={data.name}
          description={data.desc}
          gift
        />
      }
      footer={null} // RankingStack (Client Component)에 Footer
    >
      <RankingStack themeId={data.theme_id} />
    </AppShell>
  );
}
