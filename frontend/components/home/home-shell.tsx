import { HomeHeader } from "./home-header/home-header";

export function HomeShell({ children }: { children: React.ReactNode }) {
  return (
    <section style={{ minHeight: "100dvh" }}>
      <HomeHeader />
      <section style={{ zIndex: 100 }}>{children}</section>
    </section>
  );
}
