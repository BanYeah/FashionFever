import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { AppShellHeader } from "@/components/app-shell/header";
import { AppShellFooter } from "@/components/app-shell/footer";
import { Reviewing } from "@/components/theme-review/reviewing";
import { ReviewingGrid } from "@/components/theme-review/reviewing-grid";
import { ThemeHeaderData } from "@/types/api/theme";
import { getThemeHeader } from "@/utils/api/theme";

export default async function ThemeReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const themeId = Array.isArray(params["theme_id"])
    ? params["theme_id"][0]
    : params["theme_id"];

  if (!themeId) notFound();

  // 검수 권한이 없으면 '/home'으로 리다이렉트
  const reviewResult = await (async () => {
    const cookieStore = await cookies();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/reviews/${themeId}/status`,
      {
        cache: "no-store",
        headers: {
          Cookie: cookieStore.toString(),
        }, // 서버 사이드에서 호출 시, 쿠키가 자동으로 포함되지 않음
        credentials: "include",
      },
    );

    if (!res.ok) return { success: false, status: res.status };

    const data = await res.json();
    return { success: true, ...data };
  })();
  if (!reviewResult.success) notFound();
  if (!reviewResult.data.can_review) redirect(`/home`);

  // Header 정보 조회
  const headerResult = await getThemeHeader(themeId);
  if (!headerResult.success) notFound();

  const data: ThemeHeaderData = headerResult.data;

  // Active-tab 확인
  const view = Array.isArray(params["view"])
    ? params["view"][0]
    : params["view"];

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
      footer={
        <AppShellFooter
          variant="tabs"
          tabs={["검수 중", "승인된 사진", "반려된 사진"]}
          activeTab={(() => {
            switch (view) {
              case "approved":
                return 1;
              case "rejected":
                return 2;
              default:
                return 0;
            }
          })()}
          tabLinks={[
            `/theme-review?theme_id=${themeId}&view=reviewing`,
            `/theme-review?theme_id=${themeId}&view=approved`,
            `/theme-review?theme_id=${themeId}&view=rejected`,
          ]}
          tabBg="var(--gray-d9)"
        />
      }
    >
      {(() => {
        switch (view) {
          case "approved":
          case "rejected":
            return <ReviewingGrid themeId={themeId} view={view} />;
          default:
            return <Reviewing themeId={themeId} />;
        }
      })()}
    </AppShell>
  );
}
