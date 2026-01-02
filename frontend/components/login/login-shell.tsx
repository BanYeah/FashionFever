import { LoginHeader } from "./login-shell/login-header";
import { LoginFooter } from "./login-shell/login-footer";

export function LoginShell({ children }: { children: React.ReactNode }) {
  return (
    <section style={{ minHeight: "100dvh", backgroundColor: "var(--main)" }}>
      <LoginHeader />
      <section style={{ paddingBottom: "40px", zIndex: 100 }}>
        {children}
      </section>
      <LoginFooter />
    </section>
  );
}
