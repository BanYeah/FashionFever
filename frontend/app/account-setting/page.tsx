import { AppShell } from "@/components/app-shell/app-shell";
import { AppShellFooter } from "@/components/app-shell/footer";
import { Search } from "@/components/account-setting/search";

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const currentView = view === "judge" ? "judge" : "user";
  const shellVariant =
    currentView === "user" ? "user-setting" : "judge-setting";
  return (
    <AppShell
      variant={shellVariant}
      subHeader
      footer={
        <AppShellFooter
          variant="tabs"
          tabs={["유저 계정 관리", "심사위원 계정 관리"]}
          activeTab={currentView === "user" ? 0 : 1}
          tabLinks={[
            "/account-setting?view=user",
            "/account-setting?view=judge",
          ]}
        />
      }
    >
      <Search type={currentView} />
    </AppShell>
  );
}
