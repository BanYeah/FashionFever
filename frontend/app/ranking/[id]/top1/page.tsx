import { AppShell } from "@/components/app-shell/app-shell";
import { AppShellFooter } from "@/components/app-shell/footer";
import { RankingDisplay } from "@/components/ranking/ranking-display";
import { GiftReceive } from "@/components/ranking/gift-receive";
import { Stack } from "@mantine/core";

export default function RankingPage() {
  return (
    <AppShell
      gift
      footer={
        <AppShellFooter
          variant="tabs"
          tabs={["나의 최고 랭킹", "나의 랭킹", "상위 랭킹!"]}
          activeTab={0}
          tabLinks={["/", "/", "/"]}
        />
      }
    >
      <Stack gap={30} m={12}>
        <RankingDisplay />
        <GiftReceive />
      </Stack>
    </AppShell>
  );
}
