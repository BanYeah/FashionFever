import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { AppShellHeader } from "@/components/app-shell/header";
import { VoteSection } from "@/components/voting/vote-section";
import { ThemeHeaderData } from "@/types/api/theme";
import { getThemeHeader, getThemeStatus } from "@/utils/api/theme";
import { AppShellFooter } from "@/components/app-shell/footer";
import { DeliverySection } from "@/components/gift-delivery/delivery-section";

export default async function GiftDeliveryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const themeId = Array.isArray(params["theme_id"])
    ? params["theme_id"][0]
    : params["theme_id"];

  if (!themeId) notFound();

  // COMPLETE(결과 발표)이 아니면 404로
  const statusResult = await getThemeStatus(themeId);
  if (!statusResult.success) notFound();
  if (statusResult.data.status !== "COMPLETE") notFound();

  // Header 정보 조회
  const headterResult = await getThemeHeader(themeId);
  if (!headterResult.success) notFound();

  const data: ThemeHeaderData = headterResult.data;

  return (
    <AppShell
      header={
        <AppShellHeader
          themeId={data.theme_id}
          title={data.name}
          description={data.desc}
          gift
          subheader
        />
      }
      footer={<AppShellFooter variant="default" description="선물 지급 관리" />}
    >
      <DeliverySection themeId={themeId} />
    </AppShell>
  );
}
