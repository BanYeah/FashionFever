import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { AppShellHeader } from "@/components/app-shell/header";
import { AppShellFooter } from "@/components/app-shell/footer";
import { GiftList } from "@/components/gift-list/gift-list";
import { ThemeHeaderData } from "@/types/api/theme";
import { getThemeHeader, getThemeStatus } from "@/utils/api/theme";

export default async function GiftPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const themeId = Array.isArray(params["theme_id"])
    ? params["theme_id"][0]
    : params["theme_id"];

  if (!themeId) notFound();

  // ENROLLING(참가 중)이 아니면 'before-dress-up' 쿼리 파라미터 제거
  const isBeforeDressUp = params["before-dress-up"] !== undefined;
  if (isBeforeDressUp) {
    const result = await getThemeStatus(themeId);
    if (!result.success) notFound();

    if (result.data.status !== "ENROLLING")
      redirect(`/gift-list?theme_id=${themeId}`);
  }

  // Header 정보 조회
  const result = await getThemeHeader(themeId);
  if (!result.success) notFound();

  const data: ThemeHeaderData = result.data;

  return (
    <AppShell
      header={<AppShellHeader title={data.name} description={data.desc} />}
      footer={isBeforeDressUp ? <AppShellFooter variant="dressUp" /> : null}
    >
      <GiftList />
    </AppShell>
  );
}
