import { AppShell } from "@/components/app-shell/app-shell";
import { AppShellHeader } from "@/components/app-shell/header";
import { AppShellFooter } from "@/components/app-shell/footer";
import { RankingCollection } from "@/components/ranking/ranking-collection";

export default function RankingPage() {
  return (
    <AppShell
      header={<AppShellHeader gift />}
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
