import { AppShell } from "@/components/app-shell/app-shell";
import { DefaultFooter } from "@/components/app-shell/default-footer";
import { VotingDisplay } from "@/components/voting/voting";

export default function RankingPage() {
  return (
    <AppShell
      gift
      footer={
        <DefaultFooter
        />
      }
    >
      <VotingDisplay />
    </AppShell>
  );
}
