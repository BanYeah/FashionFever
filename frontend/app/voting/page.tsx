import { AppShell } from "@/components/app-shell/app-shell";
import { DefaultFooter } from "@/components/app-shell/default-footer";
import { VotingDisplay } from "@/components/voting/voting";

export default function RankingPage() {
  return (
    <AppShell variant="theme" gift subHeader footer={<DefaultFooter />}>
      <VotingDisplay />
    </AppShell>
  );
}
