import { AppShell } from "@/components/app-shell/app-shell";
import { AppShellFooter } from "@/components/app-shell/footer";
import { GiftCollection } from "@/components/gift-list/gift-collection";

interface GiftPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function GiftPage({ searchParams }: GiftPageProps) {
  const params = await searchParams;
  const id = params["id"];
  const isBeforeDressUp = params["before-dress-up"] !== undefined;
  // isBeforeDressUp의 경우, 현재 테마가 참가자 모집중인지 추가 확인 필요!

  return (
    <AppShell
      variant="theme"
      footer={isBeforeDressUp ? <AppShellFooter variant="dressUp" /> : null}
    >
      <GiftCollection />
    </AppShell>
  );
}
