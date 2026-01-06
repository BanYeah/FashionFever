import { AppShellHeader, AppShellVariant } from "./header";

interface AppShellProps {
  variant: AppShellVariant;
  gift?: boolean;
  subHeader?: boolean;
  footer: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({
  variant,
  gift,
  subHeader,
  footer,
  children,
}: AppShellProps) {
  return (
    <section style={{ minHeight: "100dvh" }}>
      <AppShellHeader variant={variant} gift={gift} subHeader={subHeader} />
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
