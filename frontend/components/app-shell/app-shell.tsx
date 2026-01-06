import { AppShellHeader } from "./header";

type ShellVariant = "theme" | "user-setting" | "judge-setting";

interface AppShellProps {
  gift?: boolean;
  subHeader?: boolean;
  footer: React.ReactNode;
  children: React.ReactNode;
  variant?: ShellVariant;
}

export function AppShell({
  gift,
  subHeader,
  footer,
  children,
  variant,
}: AppShellProps) {
  
  return (
    <section style={{ minHeight: "100dvh" }}>
      <AppShellHeader gift={gift} subHeader={subHeader} variant={variant} />
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
