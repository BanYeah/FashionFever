import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { AppShellHeader } from "@/components/app-shell/header";
import { EnrollSection } from "@/components/enroll/enroll-section";
import { ThemeHeaderData } from "@/types/api/theme";
import { getThemeHeader, getThemeStatus } from "@/utils/api/theme";

export default async function EnrollPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const themeId = Array.isArray(params["theme_id"])
    ? params["theme_id"][0]
    : params["theme_id"];

  if (!themeId) notFound();

  // ENROLLING(참가 중)이 아니면 404로
  const statusResult = await getThemeStatus(themeId);
  if (!statusResult.success) notFound();
  if (statusResult.data.status !== "ENROLLING") notFound();

  // Header 정보 조회
  const headerResult = await getThemeHeader(themeId);
  if (!headerResult.success) notFound();

  const data: ThemeHeaderData = headerResult.data;

  return (
    <AppShell
      header={<AppShellHeader title={data.name} description={data.desc} />}
      footer={null}
    >
      <EnrollSection themeId={themeId} bgLimit={data.bg_limit} />
    </AppShell>
  );
}
