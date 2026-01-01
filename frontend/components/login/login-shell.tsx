import { LoginHeader } from "./login-shell/login-header";
import { LoginFooter } from "./login-shell/login-footer";

export function LoginShell({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <LoginHeader />
      <section style={{ zIndex: 100 }}>{children}</section>
      <LoginFooter />
    </section>
  );
}
