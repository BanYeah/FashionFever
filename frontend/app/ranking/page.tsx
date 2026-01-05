import { AppShell } from "@/components/app-shell/app-shell";
import { AppShellFooter } from "@/components/app-shell/footer";
import { RankingGrid } from "@/components/ranking/ranking-grid";

export default function RankingPage() {
  return (
    <AppShell
      gift
      footer={
        <AppShellFooter
          variant="tabs"
          tabs={["나의 최고 랭킹", "나의 랭킹", "상위 랭킹!"]}
          activeTab={2}
          tabLinks={["/", "/", "/"]}
        />
      }
    >
      <RankingGrid />
    </AppShell>
  );
}
