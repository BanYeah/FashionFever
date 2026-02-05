import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { AppShellHeader } from "@/components/app-shell/header";
import { AppShellFooter } from "@/components/app-shell/footer";
import { RankingCollection } from "@/components/ranking/ranking-collection";
import { ThemeHeaderData } from "@/types/api/theme";
import { getThemeHeader } from "@/utils/api/theme";

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
      header={<AppShellHeader title={data.name} description={data.desc} gift />}
      footer={
        <AppShellFooter
          variant="tabs"
          tabs={["나의 최고 랭킹", "나의 랭킹", "상위 랭킹!"]}
          activeTab={1}
          tabLinks={["/", "/", "/"]}
        />
      }
    >
      <RankingCollection />
    </AppShell>
  );
}
