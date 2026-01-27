import { AppShell } from "@/components/app-shell/app-shell";
import { DefaultFooter } from "@/components/app-shell/default-footer";
import { AppShellHeader } from "@/components/app-shell/header";
import { VotingDisplay } from "@/components/voting/voting";

export default function RankingPage() {
  return (
    <AppShell
      header={<AppShellHeader gift subheader />}
      footer={<DefaultFooter />}
    >
      <VotingDisplay />
    </AppShell>
  );
}
