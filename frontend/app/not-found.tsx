import { LoginFooter } from "@/components/login/login-shell/login-footer";
import { LoginHeader } from "@/components/login/login-shell/login-header";
import { NotFoundSection } from "@/components/common/not-found-section/not-found-section";

export default function NotFoundPage() {
  return (
    <section style={{ minHeight: "100dvh", backgroundColor: "var(--main)" }}>
      <LoginHeader />
      <NotFoundSection />
      <LoginFooter />
    </section>
  );
}
