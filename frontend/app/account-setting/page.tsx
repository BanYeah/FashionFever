import { AppShell } from "@/components/app-shell/app-shell";
import { AppShellFooter } from "@/components/app-shell/footer";
import { AccountSetting } from "@/components/account-setting/account-setting";

export default async function AccountSettingPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const variant = !view || view === "user" ? "user" : "judge";

  return (
    <AppShell
      variant={!view || view === "user" ? "user-setting" : "judge-setting"}
      subHeader
      footer={
        <AppShellFooter
          variant="tabs"
          tabs={["유저 계정 관리", "심사위원 계정 관리"]}
          activeTab={variant === "user" ? 0 : 1}
          tabLinks={[
            "/account-setting?view=user",
            "/account-setting?view=judge",
          ]}
        />
      }
    >
      <AccountSetting variant={variant} />
    </AppShell>
  );
}
