import { AppShellHeader } from "./header";

interface AppShellProps {
  gift?: boolean;
  footer: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ gift, footer, children }: AppShellProps) {
  return (
    <section style={{ minHeight: "100dvh" }}>
      <AppShellHeader gift={gift} />
      <section
        style={{
          paddingBottom: `${footer !== null ? "60px" : "0px"}`,
          zIndex: 100,
        }}
      >
        {children}
      </section>
      {footer}
    </section>
  );
}
